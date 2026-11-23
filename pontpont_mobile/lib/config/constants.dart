class AppConfig {
  /// သင့်ရဲ့ Public Backend URL (စက်ထဲတွင် လက်ရှိ run နေသော Public IP & Port)
  static const String publicBaseUrl = 'http://13.237.255.100:3001';

  /// Default API Endpoint
  static const String shopApiEndpoint = '/api/shop';

  /// Promo code accepted by the backend (10% off)
  static const String promoCode = 'PONTPONT10';

  /// Free delivery threshold (MMK)
  static const int freeDeliveryThreshold = 100000;
}

class City {
  final String name;
  final int fee;
  const City(this.name, this.fee);
}

/// Must match `CITIES` in the web project (src/data/initialData.ts).
const List<City> kCities = [
  City('Mandalay (မန္တလေး - မြို့တွင်း)', 2500),
  City('Pyin Oo Lwin (ပြင်ဦးလွင်)', 3500),
  City('Sagaing / Monywa (စစ်ကိုင်း / မုံရွာ)', 3500),
  City('Yangon (ရန်ကုန်)', 4000),
  City('Naypyidaw (နေပြည်တော်)', 3500),
  City('Taunggyi (တောင်ကြီး)', 4000),
  City('Magway / Pakokku (မကွေး / ပခုက္ကူ)', 4000),
  City('Other Cities / ကားဂိတ်တင် (အခြားမြို့များ)', 4500),
];

City cityByName(String? name) =>
    kCities.firstWhere((c) => c.name == name, orElse: () => kCities.first);

const List<String> kOrderStatuses = [
  'Pending',
  'Confirmed',
  'Shipped',
  'Delivered',
  'Cancelled',
];

const List<String> kBadges = [
  'Best Seller',
  'New Arrival',
  'Wholesale Hot',
  'Sale',
];

const List<String> kAnnouncementTags = [
  'Promotion',
  'New Arrival',
  'Notice',
  'Wholesale',
];

class Branch {
  final String nameMm;
  final String nameEn;
  final String addressMm;
  final String addressEn;
  const Branch(this.nameMm, this.nameEn, this.addressMm, this.addressEn);
}

class ShopInfo {
  static const nameEn = 'Pont Pont Bag Shop';
  static const nameMm = 'ပုံ့ပုံ့ အိတ်အမျိုးမျိုး ရောင်းဝယ်ရေး (မန္တလေး)';
  static const taglineMm =
      'အမျိုးသမီးနှင့် အမျိုးသား လက်ကိုင်အိတ်၊ ဘေးလွယ်အိတ်၊ ကျောပိုးအိတ် လက်လီ/လက်ကား ရောင်းဝယ်ရေး';
  static const taglineEn =
      "Women's & men's handbags, crossbody bags and backpacks — retail & wholesale";
  static const ownerName = 'မပုံ့ (Ma Pont Pont)';
  static const email = 'pontpont@gmail.com';
  static const hoursMm = 'နေ့စဉ် မနက် 8:00 AM မှ ည 8:00 PM အထိ';
  static const hoursEn = 'Daily 8:00 AM – 8:00 PM';
  static const phones = ['09-963000502', '09-750072752', '09-404448881'];
  static const paymentAccounts = '09-963000502 / 09-750072752';
  static const paymentAccountName = 'Ma Pont Pont';

  static const branches = [
    Branch(
      'ပင်မဆိုင် - ၆၅ လမ်း',
      'Main Store - 65th Street',
      '၆၅ လမ်း၊ ၁၀၇ လမ်းနှင့် ၁၀၈ လမ်းကြား၊ မန္တလေးမြို့',
      '65th Street, Between 107th & 108th Streets, Mandalay',
    ),
    Branch(
      'ဆိုင်ခွဲ (၂) - ၇၃ လမ်း',
      'Branch (2) - 73rd Street',
      '၇၃ လမ်း၊ ၃၆ လမ်းနှင့် ၃၇ လမ်းကြား၊ မန္တလေးမြို့',
      '73rd Street, Between 36th & 37th Streets, Mandalay',
    ),
    Branch(
      'ဆိုင်ခွဲ (၃) - တံခွန်တိုင်',
      'Branch (3) - Thakhun Taing',
      '၇၈ လမ်း (ရန်ကုန်-မန္တလေး လမ်းမကြီး)၊ တံခွန်တိုင်ဈေးအနီး၊ ပြည်ကြီးတံခွန်မြို့နယ်၊ မန္တလေးမြို့',
      '78th Street, Near Thakhun Taing Market/Roundabout, Pyigyitagun Tsp, Mandalay',
    ),
  ];
}
