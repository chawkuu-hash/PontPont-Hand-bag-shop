import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../models/product.dart';
import '../models/shop_data.dart';
import 'api_service.dart';

/// Global app state. Widgets listen via `ListenableBuilder(listenable: appState)`.
class AppState extends ChangeNotifier {
  AppState._();
  static final AppState instance = AppState._();

  final ApiService api = ApiService();
  SharedPreferences? _prefs;

  ShopData? data;
  bool loading = false;
  String? error;

  String lang = 'mm'; // 'mm' | 'en'
  final List<CartItem> cart = [];
  final Set<String> wishlist = {};

  // Persisted cart entries waiting for products to load.
  List<Map<String, dynamic>> _pendingCart = [];

  UserProfile? get user => data?.currentUser;
  bool get isLoggedIn => user != null;
  bool get isAdmin => user?.isAdmin ?? false;
  bool get isEn => lang == 'en';

  /// Translate helper: `app.t('English', 'မြန်မာ')`.
  String t(String en, String mm) => isEn ? en : mm;

  int get cartCount => cart.fold(0, (s, i) => s + i.quantity);
  int get cartSubtotal => cart.fold(0, (s, i) => s + i.totalPrice);

  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
    final p = _prefs!;
    lang = p.getString('lang') ?? 'mm';
    final url = p.getString('baseUrl');
    if (url != null && url.isNotEmpty) api.setBaseUrl(url);
    api.sessionToken = p.getString('session');
    api.onSessionChanged = (token) {
      if (token == null) {
        p.remove('session');
      } else {
        p.setString('session', token);
      }
    };
    wishlist.addAll(p.getStringList('wishlist') ?? []);
    try {
      final raw = p.getString('cart');
      if (raw != null) {
        _pendingCart = (jsonDecode(raw) as List)
            .whereType<Map>()
            .map((e) => Map<String, dynamic>.from(e))
            .toList();
      }
    } catch (_) {}
    await refresh();
  }

  Future<void> refresh() async {
    loading = true;
    error = null;
    notifyListeners();
    try {
      _apply(await api.fetchShopData());
    } catch (e) {
      error = e.toString();
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  void _apply(ShopData d) {
    data = d;
    // Restore persisted cart once products are known.
    if (_pendingCart.isNotEmpty) {
      for (final e in _pendingCart) {
        final prod = d.products.where((p) => p.id == e['productId']);
        if (prod.isEmpty) continue;
        final c = e['color'] is Map
            ? ProductColor.fromJson(Map<String, dynamic>.from(e['color']))
            : prod.first.colors.first;
        cart.add(CartItem(
          product: prod.first,
          selectedColor: c,
          quantity: (e['quantity'] as num?)?.toInt() ?? 1,
        ));
      }
      _pendingCart = [];
    } else {
      // Keep cart products in sync with latest data (price/stock).
      for (var i = 0; i < cart.length; i++) {
        final match = d.products.where((p) => p.id == cart[i].product.id);
        if (match.isNotEmpty) {
          cart[i] = CartItem(
            product: match.first,
            selectedColor: cart[i].selectedColor,
            quantity: cart[i].quantity,
          );
        }
      }
    }
    notifyListeners();
  }

  /// Runs an API action, applies the returned db and returns the result.
  Future<ActionResult> run(Future<ActionResult> Function(ApiService) fn) async {
    final res = await fn(api);
    _apply(res.db);
    return res;
  }

  // ---------- Settings ----------
  void setLang(String l) {
    lang = l;
    _prefs?.setString('lang', l);
    notifyListeners();
  }

  Future<void> setBaseUrl(String url) async {
    api.setBaseUrl(url);
    await _prefs?.setString('baseUrl', api.baseUrl);
    await refresh();
  }

  // ---------- Auth ----------
  Future<void> logout() async {
    try {
      await run((a) => a.logout());
    } catch (_) {
      await refresh();
    }
  }

  // ---------- Cart ----------
  void _saveCart() {
    _prefs?.setString('cart', jsonEncode(cart.map((c) => c.toJson()).toList()));
  }

  void addToCart(Product p, ProductColor color, int qty) {
    final idx = cart.indexWhere(
        (c) => c.product.id == p.id && c.selectedColor.name == color.name);
    if (idx >= 0) {
      cart[idx].quantity = (cart[idx].quantity + qty).clamp(1, 99);
    } else {
      cart.add(CartItem(product: p, selectedColor: color, quantity: qty));
    }
    _saveCart();
    notifyListeners();
  }

  void setQty(CartItem item, int qty) {
    if (qty <= 0) {
      cart.remove(item);
    } else {
      item.quantity = qty.clamp(1, 99);
    }
    _saveCart();
    notifyListeners();
  }

  void removeFromCart(CartItem item) {
    cart.remove(item);
    _saveCart();
    notifyListeners();
  }

  void clearCart() {
    cart.clear();
    _saveCart();
    notifyListeners();
  }

  // ---------- Wishlist ----------
  void toggleWishlist(String productId) {
    if (!wishlist.remove(productId)) wishlist.add(productId);
    _prefs?.setStringList('wishlist', wishlist.toList());
    notifyListeners();
  }
}

final appState = AppState.instance;
