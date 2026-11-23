import 'package:flutter/material.dart';

/// Mirrors the 3 storefront themes from the web project (SHOP_THEMES).
class ShopTheme {
  final String id;
  final String nameEn;
  final String nameMm;
  final String descriptionEn;
  final String descriptionMm;
  final Color background;
  final Color heroStart;
  final Color heroEnd;
  final Color accent;
  final Color onHero;
  final double radius;

  const ShopTheme({
    required this.id,
    required this.nameEn,
    required this.nameMm,
    required this.descriptionEn,
    required this.descriptionMm,
    required this.background,
    required this.heroStart,
    required this.heroEnd,
    required this.accent,
    required this.onHero,
    required this.radius,
  });

  LinearGradient get heroGradient => LinearGradient(
        colors: [heroStart, heroEnd],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      );

  ThemeData toThemeData() {
    final shape = RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(radius),
    );
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: background,
      colorScheme: ColorScheme.fromSeed(
        seedColor: accent,
        primary: heroStart,
        secondary: accent,
        surface: background,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: heroStart,
        foregroundColor: onHero,
        centerTitle: false,
        elevation: 0,
      ),
      cardTheme: CardThemeData(
        color: Colors.white,
        elevation: 0,
        shape: shape,
        margin: EdgeInsets.zero,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: heroStart,
          foregroundColor: onHero,
          shape: shape,
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radius),
        ),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      ),
      chipTheme: ChipThemeData(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radius == 0 ? 0 : 20),
        ),
      ),
      navigationBarTheme: NavigationBarThemeData(
        indicatorColor: accent.withOpacity(0.25),
      ),
    );
  }
}

const List<ShopTheme> kShopThemes = [
  ShopTheme(
    id: 'luxury-gold',
    nameEn: 'Classic Luxury Gold',
    nameMm: 'ရွှေအိုရောင် ဇိမ်ခံဒီဇိုင်း',
    descriptionEn: 'Warm ivory and espresso gold palette with rounded cards.',
    descriptionMm: 'နွေးထွေးသော ရွှေအိုရောင်နှင့် အညိုရင့်ရောင် ဒီဇိုင်း',
    background: Color(0xFFFAF7F2),
    heroStart: Color(0xFF1C1917),
    heroEnd: Color(0xFF451A03),
    accent: Color(0xFFFBBF24),
    onHero: Color(0xFFFBBF24),
    radius: 14,
  ),
  ShopTheme(
    id: 'rose-paris',
    nameEn: 'Parisian Rose & Pastel',
    nameMm: 'ပန်းနုရောင် ဖက်ရှင်ဒီဇိုင်း',
    descriptionEn: 'Soft blush pink and rose-berry palette, feminine and soft.',
    descriptionMm: 'နူးညံ့လှပသော ပန်းနုရောင်၊ Rose-Gold ဒီဇိုင်း',
    background: Color(0xFFFFF5F7),
    heroStart: Color(0xFF881337),
    heroEnd: Color(0xFFBE185D),
    accent: Color(0xFFF43F5E),
    onHero: Color(0xFFFFE4E6),
    radius: 24,
  ),
  ShopTheme(
    id: 'minimal-noir',
    nameEn: 'Modern Editorial Noir & Emerald',
    nameMm: 'ခေတ်မီ အနက်နှင့် မြစိမ်းရောင် ဒီဇိုင်း',
    descriptionEn: 'High-contrast jet black and emerald with sharp corners.',
    descriptionMm: 'ထောင့်ချိုးပြတ်သားသော အနက်နှင့် မြစိမ်းရောင်',
    background: Color(0xFFF4F6F8),
    heroStart: Color(0xFF09090B),
    heroEnd: Color(0xFF064E3B),
    accent: Color(0xFF10B981),
    onHero: Color(0xFF6EE7B7),
    radius: 0,
  ),
];

ShopTheme themeById(String? id) =>
    kShopThemes.firstWhere((t) => t.id == id, orElse: () => kShopThemes.first);
