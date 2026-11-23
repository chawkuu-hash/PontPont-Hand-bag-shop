import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;

import '../config/constants.dart';
import '../models/product.dart';
import '../models/shop_data.dart';

class ApiException implements Exception {
  final String message;
  final int? statusCode;
  ApiException(this.message, [this.statusCode]);
  @override
  String toString() => message;
}

/// Result of a POST action: refreshed scoped db + optional extras.
class ActionResult {
  final ShopData db;
  final Map<String, dynamic> raw;
  ActionResult(this.db, this.raw);

  UserProfile? get user => raw['user'] is Map
      ? UserProfile.fromJson(Map<String, dynamic>.from(raw['user']))
      : null;
  Order? get order => raw['order'] is Map
      ? Order.fromJson(Map<String, dynamic>.from(raw['order']))
      : null;
}

/// Talks to the Next.js backend at `/api/shop`.
///
/// The backend authenticates with an httpOnly `pontpont_session` cookie,
/// so we capture it from `Set-Cookie` and replay it as a `Cookie` header.
class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  static const _cookieName = 'pontpont_session';
  final http.Client _client = http.Client();

  String _baseUrl = AppConfig.publicBaseUrl;
  String get baseUrl => _baseUrl;
  void setBaseUrl(String url) {
    var u = url.trim();
    while (u.endsWith('/')) {
      u = u.substring(0, u.length - 1);
    }
    _baseUrl = u;
  }

  /// Session token (persisted by AppState).
  String? sessionToken;

  /// Called whenever the session token changes so it can be persisted.
  void Function(String? token)? onSessionChanged;

  Uri get _uri => Uri.parse('$_baseUrl${AppConfig.shopApiEndpoint}');

  Map<String, String> _headers() => {
        'Content-Type': 'application/json; charset=UTF-8',
        'Accept': 'application/json',
        if (sessionToken != null) 'Cookie': '$_cookieName=$sessionToken',
      };

  void _captureCookie(http.Response res) {
    final setCookie = res.headers['set-cookie'];
    if (setCookie == null) return;
    final match = RegExp('$_cookieName=([^;,]*)').firstMatch(setCookie);
    if (match == null) return;
    final value = match.group(1) ?? '';
    final expired = value.isEmpty ||
        setCookie.contains('Max-Age=0') ||
        setCookie.contains('1970');
    sessionToken = expired ? null : value;
    onSessionChanged?.call(sessionToken);
  }

  Map<String, dynamic> _decode(http.Response res) {
    try {
      final body = jsonDecode(utf8.decode(res.bodyBytes));
      if (body is Map<String, dynamic>) return body;
    } catch (_) {}
    throw ApiException('Invalid server response (${res.statusCode})',
        res.statusCode);
  }

  ApiException _networkError() => ApiException(
        'Backend server သို့ ချိတ်ဆက်၍ မရပါ ($_baseUrl)\n'
        'Cannot reach the server. Check internet or the Server URL in Settings.',
      );

  /// GET /api/shop
  Future<ShopData> fetchShopData() async {
    try {
      final res = await _client
          .get(_uri, headers: _headers())
          .timeout(const Duration(seconds: 15));
      _captureCookie(res);
      final body = _decode(res);
      if (res.statusCode != 200) {
        throw ApiException(
            body['error']?.toString() ?? 'Server error', res.statusCode);
      }
      return ShopData.fromJson(body);
    } on SocketException {
      throw _networkError();
    } on TimeoutException {
      throw _networkError();
    } on http.ClientException {
      throw _networkError();
    }
  }

  /// POST /api/shop with `{action, ...payload}`.
  Future<ActionResult> _post(String action,
      [Map<String, dynamic> payload = const {}]) async {
    try {
      final res = await _client
          .post(
            _uri,
            headers: _headers(),
            body: jsonEncode({'action': action, ...payload}),
          )
          .timeout(const Duration(seconds: 20));
      _captureCookie(res);
      final body = _decode(res);
      if (res.statusCode != 200 || body['ok'] != true) {
        throw ApiException(
            body['error']?.toString() ?? 'Request failed', res.statusCode);
      }
      final db = body['db'] is Map
          ? ShopData.fromJson(Map<String, dynamic>.from(body['db']))
          : await fetchShopData();
      return ActionResult(db, body);
    } on SocketException {
      throw _networkError();
    } on TimeoutException {
      throw _networkError();
    } on http.ClientException {
      throw _networkError();
    }
  }

  // ---------------- Auth ----------------
  Future<ActionResult> login(String email, String password) =>
      _post('LOGIN', {'email': email, 'password': password});

  Future<ActionResult> register({
    required String name,
    required String email,
    required String password,
    required String phone,
    required String city,
    required String address,
  }) =>
      _post('REGISTER', {
        'name': name,
        'email': email,
        'password': password,
        'phone': phone,
        'city': city,
        'address': address,
      });

  Future<ActionResult> logout() async {
    try {
      return await _post('LOGOUT');
    } finally {
      sessionToken = null;
      onSessionChanged?.call(null);
    }
  }

  Future<ActionResult> updateProfile({
    required String userId,
    String? name,
    String? phone,
    String? city,
    String? address,
    String? newPassword,
  }) =>
      _post('UPDATE_PROFILE', {
        'userId': userId,
        if (name != null) 'name': name,
        if (phone != null) 'phone': phone,
        if (city != null) 'city': city,
        if (address != null) 'address': address,
        if (newPassword != null && newPassword.isNotEmpty)
          'newPassword': newPassword,
      });

  // ---------------- Orders ----------------
  Future<ActionResult> createOrder({
    required String customerName,
    required String phone,
    required String city,
    required String address,
    required String paymentMethod,
    required List<CartItem> cartItems,
    required bool promoApplied,
    String? transactionRef,
    String? note,
    String? userEmail,
  }) =>
      _post('CREATE_ORDER', {
        'order': {
          'customerName': customerName,
          'phone': phone,
          'city': city,
          'address': address,
          'paymentMethod': paymentMethod,
          if (transactionRef != null && transactionRef.isNotEmpty)
            'transactionRef': transactionRef,
          if (note != null && note.isNotEmpty) 'note': note,
          'discount': promoApplied ? 1 : 0,
          if (userEmail != null) 'userEmail': userEmail,
          'items': cartItems
              .map((ci) => {
                    'productId': ci.product.id,
                    'nameEn': ci.product.nameEn,
                    'nameMm': ci.product.nameMm,
                    'price': ci.unitPrice,
                    'quantity': ci.quantity,
                    'selectedColor': ci.selectedColor.name,
                    'image': ci.product.image,
                  })
              .toList(),
        },
      });

  // ---------------- Admin ----------------
  Future<ActionResult> updateOrderStatus(String orderId, String status) =>
      _post('UPDATE_ORDER_STATUS', {'orderId': orderId, 'status': status});

  Future<ActionResult> addProduct(Product p) =>
      _post('ADD_PRODUCT', {'product': p.toJson()});

  Future<ActionResult> updateProduct(Product p) =>
      _post('UPDATE_PRODUCT', {'product': p.toJson()});

  Future<ActionResult> deleteProduct(String productId) =>
      _post('DELETE_PRODUCT', {'productId': productId});

  Future<ActionResult> addCategory(CategoryItem c) =>
      _post('ADD_CATEGORY', {'category': c.toJson()});

  Future<ActionResult> deleteCategory(String categoryId) =>
      _post('DELETE_CATEGORY', {'categoryId': categoryId});

  Future<ActionResult> addAnnouncement(Announcement a) =>
      _post('ADD_ANNOUNCEMENT', {'announcement': a.toJson()});

  Future<ActionResult> deleteAnnouncement(String id) =>
      _post('DELETE_ANNOUNCEMENT', {'announcementId': id});

  Future<ActionResult> updateUserRole(String userId, String role) =>
      _post('UPDATE_USER_ROLE', {'userId': userId, 'role': role});

  Future<ActionResult> deleteUser(String userId) =>
      _post('DELETE_USER', {'userId': userId});

  Future<ActionResult> updateTheme(String theme) =>
      _post('UPDATE_THEME', {'theme': theme});
}
