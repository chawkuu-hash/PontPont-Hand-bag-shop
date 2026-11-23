import 'product.dart';

class CategoryItem {
  final String id;
  final String labelEn;

  const CategoryItem({required this.id, required this.labelEn});

  factory CategoryItem.fromJson(Map<String, dynamic> json) => CategoryItem(
        id: json['id']?.toString() ?? '',
        labelEn: json['labelEn']?.toString() ?? '',
      );

  Map<String, dynamic> toJson() => {'id': id, 'labelEn': labelEn};
}

class Announcement {
  final String id;
  final String title;
  final String content;
  final String tag;
  final String? image;
  final String createdAt;
  final String? authorName;

  const Announcement({
    required this.id,
    required this.title,
    required this.content,
    required this.tag,
    this.image,
    required this.createdAt,
    this.authorName,
  });

  factory Announcement.fromJson(Map<String, dynamic> json) => Announcement(
        id: json['id']?.toString() ?? '',
        title: json['title']?.toString() ?? '',
        content: json['content']?.toString() ?? '',
        tag: json['tag']?.toString() ?? 'Notice',
        image: json['image']?.toString(),
        createdAt: json['createdAt']?.toString() ?? '',
        authorName: json['authorName']?.toString(),
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'content': content,
        'tag': tag,
        if (image != null && image!.isNotEmpty) 'image': image,
        'createdAt': createdAt,
        if (authorName != null) 'authorName': authorName,
      };
}

class UserProfile {
  final String id;
  final String name;
  final String email;
  final String phone;
  final String city;
  final String address;
  final String role;
  final String createdAt;

  const UserProfile({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.city,
    required this.address,
    required this.role,
    required this.createdAt,
  });

  bool get isAdmin => role == 'admin';

  factory UserProfile.fromJson(Map<String, dynamic> json) => UserProfile(
        id: json['id']?.toString() ?? '',
        name: json['name']?.toString() ?? '',
        email: json['email']?.toString() ?? '',
        phone: json['phone']?.toString() ?? '',
        city: json['city']?.toString() ?? '',
        address: json['address']?.toString() ?? '',
        role: json['role']?.toString() ?? 'customer',
        createdAt: json['createdAt']?.toString() ?? '',
      );
}

class OrderItem {
  final String productId;
  final String nameEn;
  final String nameMm;
  final int price;
  final int quantity;
  final String selectedColor;
  final String image;

  const OrderItem({
    required this.productId,
    required this.nameEn,
    required this.nameMm,
    required this.price,
    required this.quantity,
    required this.selectedColor,
    required this.image,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) => OrderItem(
        productId: json['productId']?.toString() ?? '',
        nameEn: json['nameEn']?.toString() ?? '',
        nameMm: json['nameMm']?.toString() ?? '',
        price: (json['price'] as num?)?.toInt() ?? 0,
        quantity: (json['quantity'] as num?)?.toInt() ?? 1,
        selectedColor: json['selectedColor']?.toString() ?? '',
        image: json['image']?.toString() ?? '',
      );
}

class Order {
  final String id;
  final String customerName;
  final String phone;
  final String city;
  final String address;
  final String? note;
  final String paymentMethod;
  final String? transactionRef;
  final List<OrderItem> items;
  final int subtotal;
  final int discount;
  final int deliveryFee;
  final int total;
  final String status;
  final String createdAt;
  final String? userEmail;

  const Order({
    required this.id,
    required this.customerName,
    required this.phone,
    required this.city,
    required this.address,
    this.note,
    required this.paymentMethod,
    this.transactionRef,
    required this.items,
    required this.subtotal,
    required this.discount,
    required this.deliveryFee,
    required this.total,
    required this.status,
    required this.createdAt,
    this.userEmail,
  });

  factory Order.fromJson(Map<String, dynamic> json) => Order(
        id: json['id']?.toString() ?? '',
        customerName: json['customerName']?.toString() ?? '',
        phone: json['phone']?.toString() ?? '',
        city: json['city']?.toString() ?? '',
        address: json['address']?.toString() ?? '',
        note: json['note']?.toString(),
        paymentMethod: json['paymentMethod']?.toString() ?? 'COD',
        transactionRef: json['transactionRef']?.toString(),
        items: (json['items'] as List? ?? [])
            .whereType<Map>()
            .map((e) => OrderItem.fromJson(Map<String, dynamic>.from(e)))
            .toList(),
        subtotal: (json['subtotal'] as num?)?.toInt() ?? 0,
        discount: (json['discount'] as num?)?.toInt() ?? 0,
        deliveryFee: (json['deliveryFee'] as num?)?.toInt() ?? 0,
        total: (json['total'] as num?)?.toInt() ?? 0,
        status: json['status']?.toString() ?? 'Pending',
        createdAt: json['createdAt']?.toString() ?? '',
        userEmail: json['userEmail']?.toString(),
      );
}

/// Scoped response returned by GET /api/shop and every POST action (`db`).
class ShopData {
  final List<Product> products;
  final List<CategoryItem> categories;
  final List<Announcement> announcements;
  final List<Order> orders;
  final List<UserProfile> users;
  final int usersCount;
  final UserProfile? currentUser;
  final String theme;

  const ShopData({
    required this.products,
    required this.categories,
    required this.announcements,
    required this.orders,
    required this.users,
    required this.usersCount,
    required this.currentUser,
    required this.theme,
  });

  static List<Map<String, dynamic>> _maps(dynamic raw) => (raw as List? ?? [])
      .whereType<Map>()
      .map((e) => Map<String, dynamic>.from(e))
      .toList();

  factory ShopData.fromJson(Map<String, dynamic> json) {
    final cu = json['currentUser'];
    return ShopData(
      products: _maps(json['products']).map(Product.fromJson).toList(),
      categories: _maps(json['categories']).map(CategoryItem.fromJson).toList(),
      announcements:
          _maps(json['announcements']).map(Announcement.fromJson).toList(),
      orders: _maps(json['orders']).map(Order.fromJson).toList(),
      users: _maps(json['users']).map(UserProfile.fromJson).toList(),
      usersCount: (json['usersCount'] as num?)?.toInt() ?? 0,
      currentUser: cu is Map
          ? UserProfile.fromJson(Map<String, dynamic>.from(cu))
          : null,
      theme: json['theme']?.toString() ?? 'luxury-gold',
    );
  }
}

class CartItem {
  final Product product;
  final ProductColor selectedColor;
  int quantity;

  CartItem({
    required this.product,
    required this.selectedColor,
    this.quantity = 1,
  });

  /// The backend always charges the retail price (server-side verified),
  /// so the app shows the same price to avoid mismatched totals.
  int get unitPrice => product.price;

  int get totalPrice => unitPrice * quantity;

  Map<String, dynamic> toJson() => {
        'productId': product.id,
        'color': selectedColor.toJson(),
        'quantity': quantity,
      };
}
