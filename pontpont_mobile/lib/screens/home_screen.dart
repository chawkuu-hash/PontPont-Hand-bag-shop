import 'package:flutter/material.dart';

import '../config/constants.dart';
import '../config/themes.dart';
import '../models/product.dart';
import '../services/app_state.dart';
import '../widgets/common.dart';
import 'product_detail_screen.dart';
import 'settings_screen.dart';

class HomeScreen extends StatefulWidget {
  final VoidCallback onOpenCart;
  const HomeScreen({super.key, required this.onOpenCart});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String _category = 'All';
  String _query = '';
  String _sort = 'featured';
  bool _wishlistOnly = false;

  List<Product> _filtered() {
    final app = appState;
    final list = (app.data?.products ?? []).where((p) {
      if (_wishlistOnly && !app.wishlist.contains(p.id)) return false;
      if (_category != 'All' && p.category != _category) return false;
      final q = _query.trim().toLowerCase();
      if (q.isEmpty) return true;
      return p.nameEn.toLowerCase().contains(q) ||
          p.nameMm.toLowerCase().contains(q) ||
          p.category.toLowerCase().contains(q) ||
          p.categoryMm.toLowerCase().contains(q) ||
          p.descriptionMm.toLowerCase().contains(q);
    }).toList();
    switch (_sort) {
      case 'price-asc':
        list.sort((a, b) => a.price.compareTo(b.price));
      case 'price-desc':
        list.sort((a, b) => b.price.compareTo(a.price));
      case 'rating':
        list.sort((a, b) => b.rating.compareTo(a.rating));
    }
    return list;
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: appState,
      builder: (context, _) {
        final app = appState;
        final theme = themeById(app.data?.theme);
        return Scaffold(
          appBar: AppBar(
            title: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('PontPont Bag Shop',
                    style:
                        TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                Text(app.t('Mandalay • Retail & Wholesale',
                        'မန္တလေး • လက်လီ/လက်ကား'),
                    style: const TextStyle(fontSize: 11)),
              ],
            ),
            actions: [
              const LangToggle(),
              IconButton(
                tooltip: 'Wishlist',
                icon: Icon(
                    _wishlistOnly ? Icons.favorite : Icons.favorite_border),
                onPressed: () =>
                    setState(() => _wishlistOnly = !_wishlistOnly),
              ),
              IconButton(
                tooltip: 'Settings',
                icon: const Icon(Icons.settings_outlined),
                onPressed: () => Navigator.push(context,
                    MaterialPageRoute(builder: (_) => const SettingsScreen())),
              ),
            ],
          ),
          body: _body(app, theme),
        );
      },
    );
  }

  Widget _body(AppState app, ShopTheme theme) {
    if (app.data == null && app.loading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (app.data == null && app.error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            const Icon(Icons.cloud_off, size: 64, color: Colors.grey),
            const SizedBox(height: 12),
            Text(app.error!, textAlign: TextAlign.center),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: app.refresh,
              icon: const Icon(Icons.refresh),
              label: Text(app.t('Retry', 'ထပ်မံကြိုးစားမည်')),
            ),
            TextButton(
              onPressed: () => Navigator.push(context,
                  MaterialPageRoute(builder: (_) => const SettingsScreen())),
              child: Text(app.t('Change Server URL', 'Server URL ပြောင်းရန်')),
            ),
          ]),
        ),
      );
    }

    final products = _filtered();
    final categories = app.data?.categories ?? [];
    final anns = app.data?.announcements ?? [];

    return RefreshIndicator(
      onRefresh: app.refresh,
      child: CustomScrollView(
        slivers: [
          // Hero
          SliverToBoxAdapter(
            child: Container(
              margin: const EdgeInsets.fromLTRB(16, 16, 16, 0),
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                gradient: theme.heroGradient,
                borderRadius: BorderRadius.circular(theme.radius),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(app.isEn ? ShopInfo.nameEn : ShopInfo.nameMm,
                      style: TextStyle(
                          color: theme.onHero,
                          fontSize: 17,
                          fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  Text(app.isEn ? ShopInfo.taglineEn : ShopInfo.taglineMm,
                      style: const TextStyle(
                          color: Colors.white70, fontSize: 12, height: 1.4)),
                  const SizedBox(height: 10),
                  Text(
                    app.t(
                        '🎁 Free delivery over ${mmk(AppConfig.freeDeliveryThreshold)} • Code ${AppConfig.promoCode} = 10% off',
                        '🎁 ${mmk(AppConfig.freeDeliveryThreshold)} အထက် အခမဲ့ပို့ • ${AppConfig.promoCode} ကုဒ်ဖြင့် 10% လျှော့'),
                    style: TextStyle(color: theme.accent, fontSize: 11),
                  ),
                ],
              ),
            ),
          ),

          // Announcement banner
          if (anns.isNotEmpty)
            SliverToBoxAdapter(
              child: Card(
                margin: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                child: ListTile(
                  leading: Icon(Icons.campaign, color: theme.heroEnd),
                  title: Text(anns.first.title,
                      maxLines: 1, overflow: TextOverflow.ellipsis),
                  subtitle: Text(anns.first.content,
                      maxLines: 1, overflow: TextOverflow.ellipsis),
                  trailing: Text(anns.first.tag,
                      style: const TextStyle(fontSize: 10)),
                ),
              ),
            ),

          // Search + sort
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
              child: Row(children: [
                Expanded(
                  child: TextField(
                    onChanged: (v) => setState(() => _query = v),
                    decoration: InputDecoration(
                      hintText: app.t('Search bags...', 'အိတ်အမည် ရှာရန်...'),
                      prefixIcon: const Icon(Icons.search),
                      isDense: true,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                PopupMenuButton<String>(
                  icon: const Icon(Icons.sort),
                  initialValue: _sort,
                  onSelected: (v) => setState(() => _sort = v),
                  itemBuilder: (_) => [
                    PopupMenuItem(
                        value: 'featured',
                        child: Text(app.t('Featured', 'အထူးပြု'))),
                    PopupMenuItem(
                        value: 'price-asc',
                        child: Text(app.t('Price: Low → High',
                            'ဈေးနှုန်း: နည်း → များ'))),
                    PopupMenuItem(
                        value: 'price-desc',
                        child: Text(app.t('Price: High → Low',
                            'ဈေးနှုန်း: များ → နည်း'))),
                    PopupMenuItem(
                        value: 'rating',
                        child: Text(app.t('Top Rated', 'အဆင့်မြင့်ဆုံး'))),
                  ],
                ),
              ]),
            ),
          ),

          // Categories
          SliverToBoxAdapter(
            child: SizedBox(
              height: 48,
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 12),
                children: [
                  if (!categories.any((c) => c.id == 'All'))
                    _chip('All', app.t('All Bags', 'အားလုံး')),
                  ...categories.map((c) => _chip(c.id, c.labelEn)),
                ],
              ),
            ),
          ),

          if (_wishlistOnly)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Text(
                    app.t('❤ Showing wishlist only', '❤ နှစ်သက်သော အိတ်များသာ'),
                    style: const TextStyle(fontWeight: FontWeight.w600)),
              ),
            ),

          // Grid
          SliverPadding(
            padding: const EdgeInsets.all(16),
            sliver: products.isEmpty
                ? SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.all(32),
                      child: Center(
                          child: Text(app.t('No bags found',
                              'ကိုက်ညီသော အိတ်မရှိပါ'))),
                    ),
                  )
                : SliverGrid(
                    gridDelegate:
                        const SliverGridDelegateWithMaxCrossAxisExtent(
                      maxCrossAxisExtent: 240,
                      childAspectRatio: 0.62,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                    ),
                    delegate: SliverChildBuilderDelegate(
                      (context, i) => _ProductCard(product: products[i]),
                      childCount: products.length,
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _chip(String id, String label) {
    final selected = _category == id;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 6),
      child: ChoiceChip(
        label: Text(label),
        selected: selected,
        onSelected: (_) => setState(() => _category = id),
      ),
    );
  }
}

class _ProductCard extends StatelessWidget {
  final Product product;
  const _ProductCard({required this.product});

  @override
  Widget build(BuildContext context) {
    final app = appState;
    final p = product;
    final theme = themeById(app.data?.theme);
    final liked = app.wishlist.contains(p.id);
    return Card(
      clipBehavior: Clip.antiAlias,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(theme.radius),
        side: theme.radius == 0
            ? const BorderSide(color: Colors.black, width: 2)
            : BorderSide(color: Colors.grey.shade200),
      ),
      child: InkWell(
        onTap: () => Navigator.push(context,
            MaterialPageRoute(builder: (_) => ProductDetailScreen(product: p))),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Stack(fit: StackFit.expand, children: [
                AppImage(p.image),
                if (p.badge != null && p.badge!.isNotEmpty)
                  Positioned(
                    top: 8,
                    left: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 6, vertical: 3),
                      color: theme.heroStart,
                      child: Text(p.badge!,
                          style: TextStyle(
                              color: theme.onHero,
                              fontSize: 9,
                              fontWeight: FontWeight.bold)),
                    ),
                  ),
                Positioned(
                  top: 2,
                  right: 2,
                  child: IconButton(
                    icon: Icon(liked ? Icons.favorite : Icons.favorite_border,
                        color: liked ? Colors.red : Colors.white),
                    onPressed: () => app.toggleWishlist(p.id),
                  ),
                ),
                if (p.stock <= 0)
                  Container(
                    color: Colors.black45,
                    alignment: Alignment.center,
                    child: Text(app.t('Out of stock', 'ပစ္စည်းကုန်'),
                        style: const TextStyle(
                            color: Colors.white, fontWeight: FontWeight.bold)),
                  ),
              ]),
            ),
            Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(app.isEn ? p.nameEn : p.nameMm,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                          fontWeight: FontWeight.bold, fontSize: 13)),
                  Text(p.category,
                      style: TextStyle(
                          color: Colors.grey.shade600, fontSize: 11)),
                  const SizedBox(height: 4),
                  Row(children: [
                    Expanded(
                      child: Text(mmk(p.price),
                          style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: theme.heroEnd,
                              fontSize: 14)),
                    ),
                    const Icon(Icons.star, size: 13, color: Colors.amber),
                    Text(p.rating.toStringAsFixed(1),
                        style: const TextStyle(fontSize: 11)),
                  ]),
                  if (p.originalPrice != null && p.originalPrice! > p.price)
                    Text(mmk(p.originalPrice!),
                        style: const TextStyle(
                            fontSize: 11,
                            color: Colors.grey,
                            decoration: TextDecoration.lineThrough)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
