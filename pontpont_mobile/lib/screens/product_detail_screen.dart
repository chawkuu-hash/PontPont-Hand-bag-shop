import 'package:flutter/material.dart';

import '../config/themes.dart';
import '../models/product.dart';
import '../services/app_state.dart';
import '../widgets/common.dart';

class ProductDetailScreen extends StatefulWidget {
  final Product product;
  const ProductDetailScreen({super.key, required this.product});

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  late ProductColor _color = widget.product.colors.first;
  int _qty = 1;

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: appState,
      builder: (context, _) {
        final app = appState;
        final p = widget.product;
        final theme = themeById(app.data?.theme);
        final liked = app.wishlist.contains(p.id);
        final outOfStock = p.stock <= 0;

        return Scaffold(
          appBar: AppBar(
            title: Text(app.isEn ? p.nameEn : p.nameMm,
                overflow: TextOverflow.ellipsis),
            actions: [
              IconButton(
                icon: Icon(liked ? Icons.favorite : Icons.favorite_border,
                    color: liked ? Colors.red : null),
                onPressed: () => app.toggleWishlist(p.id),
              ),
            ],
          ),
          body: ListView(
            padding: const EdgeInsets.only(bottom: 24),
            children: [
              AspectRatio(aspectRatio: 1, child: AppImage(p.image)),
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (p.badge != null && p.badge!.isNotEmpty)
                      Chip(label: Text(p.badge!)),
                    Text(p.nameMm,
                        style: const TextStyle(
                            fontSize: 20, fontWeight: FontWeight.bold)),
                    Text(p.nameEn,
                        style: TextStyle(color: Colors.grey.shade600)),
                    const SizedBox(height: 8),
                    Row(children: [
                      Text(mmk(p.price),
                          style: TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                              color: theme.heroEnd)),
                      const SizedBox(width: 8),
                      if (p.originalPrice != null &&
                          p.originalPrice! > p.price)
                        Text(mmk(p.originalPrice!),
                            style: const TextStyle(
                                color: Colors.grey,
                                decoration: TextDecoration.lineThrough)),
                      const Spacer(),
                      const Icon(Icons.star, color: Colors.amber, size: 18),
                      Text(' ${p.rating} (${p.reviewsCount})'),
                    ]),
                    if (p.wholesalePrice != null && p.wholesalePrice! > 0)
                      Container(
                        margin: const EdgeInsets.only(top: 8),
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: theme.accent.withOpacity(0.12),
                          borderRadius:
                              BorderRadius.circular(theme.radius / 2),
                        ),
                        child: Text(app.t(
                            '📦 Wholesale (5+ pcs): ${mmk(p.wholesalePrice!)} — contact shop for wholesale orders',
                            '📦 လက်ကားဈေး (၅ လုံးအထက်): ${mmk(p.wholesalePrice!)} — လက်ကားအတွက် ဆိုင်သို့ ဆက်သွယ်ပါ')),
                      ),
                    const SizedBox(height: 8),
                    Text(
                      outOfStock
                          ? app.t('Out of stock', 'ပစ္စည်းကုန်နေပါသည်')
                          : app.t('In stock: ${p.stock}',
                              'လက်ကျန်: ${p.stock} လုံး'),
                      style: TextStyle(
                          color: outOfStock ? Colors.red : Colors.green,
                          fontWeight: FontWeight.w600),
                    ),
                    SectionTitle(app.t('Color', 'အရောင်')),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: p.colors.map((c) {
                        final sel = c.name == _color.name;
                        return ChoiceChip(
                          avatar: CircleAvatar(
                              backgroundColor: hexColor(c.hex), radius: 8),
                          label: Text(c.name),
                          selected: sel,
                          onSelected: (_) => setState(() => _color = c),
                        );
                      }).toList(),
                    ),
                    SectionTitle(app.t('Quantity', 'အရေအတွက်')),
                    Row(children: [
                      IconButton.outlined(
                        onPressed:
                            _qty > 1 ? () => setState(() => _qty--) : null,
                        icon: const Icon(Icons.remove),
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Text('$_qty',
                            style: const TextStyle(
                                fontSize: 18, fontWeight: FontWeight.bold)),
                      ),
                      IconButton.outlined(
                        onPressed: _qty < 99 && _qty < p.stock
                            ? () => setState(() => _qty++)
                            : null,
                        icon: const Icon(Icons.add),
                      ),
                    ]),
                    SectionTitle(app.t('Details', 'အသေးစိတ်')),
                    if (p.material.isNotEmpty)
                      _row(app.t('Material', 'ပစ္စည်း'), p.material),
                    if (p.dimensions.isNotEmpty)
                      _row(app.t('Size', 'အရွယ်အစား'), p.dimensions),
                    _row(app.t('Category', 'အမျိုးအစား'), p.category),
                    const SizedBox(height: 8),
                    Text(app.isEn ? p.descriptionEn : p.descriptionMm,
                        style: const TextStyle(height: 1.5)),
                  ],
                ),
              ),
            ],
          ),
          bottomNavigationBar: SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: ElevatedButton.icon(
                onPressed: outOfStock
                    ? null
                    : () {
                        app.addToCart(p, _color, _qty);
                        toast(
                            context,
                            app.t('Added to cart',
                                'ဈေးခြင်းထဲ ထည့်ပြီးပါပြီ'));
                        Navigator.pop(context);
                      },
                icon: const Icon(Icons.add_shopping_cart),
                label: Text(
                    '${app.t('Add to Cart', 'ဈေးခြင်းထဲထည့်မည်')} • ${mmk(p.price * _qty)}'),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _row(String k, String v) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 3),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          SizedBox(
              width: 100,
              child: Text(k, style: TextStyle(color: Colors.grey.shade600))),
          Expanded(child: Text(v)),
        ]),
      );
}
