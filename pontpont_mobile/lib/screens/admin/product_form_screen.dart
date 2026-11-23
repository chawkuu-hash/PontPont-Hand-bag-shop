import 'package:flutter/material.dart';

import '../../config/constants.dart';
import '../../models/product.dart';
import '../../services/app_state.dart';
import '../../widgets/common.dart';
import 'admin_dashboard.dart';

/// Add / edit a product (ADD_PRODUCT / UPDATE_PRODUCT).
class ProductFormScreen extends StatefulWidget {
  final Product? product;
  const ProductFormScreen({super.key, this.product});

  @override
  State<ProductFormScreen> createState() => _ProductFormScreenState();
}

class _ProductFormScreenState extends State<ProductFormScreen> {
  final _form = GlobalKey<FormState>();
  late final Product? p = widget.product;
  late final _nameEn = TextEditingController(text: p?.nameEn ?? '');
  late final _nameMm = TextEditingController(text: p?.nameMm ?? '');
  late final _price = TextEditingController(text: '${p?.price ?? 29500}');
  late final _original =
      TextEditingController(text: p?.originalPrice?.toString() ?? '');
  late final _wholesale =
      TextEditingController(text: p?.wholesalePrice?.toString() ?? '');
  late final _stock = TextEditingController(text: '${p?.stock ?? 30}');
  late final _image = TextEditingController(text: p?.image ?? '');
  late final _material =
      TextEditingController(text: p?.material ?? 'High-Grade PU Leather');
  late final _dimensions =
      TextEditingController(text: p?.dimensions ?? '25cm x 18cm x 9cm');
  late final _descMm = TextEditingController(
      text: p?.descriptionMm ??
          'ပုံ့ပုံ့ အိတ်ဆိုင် (မန္တလေး) ၏ ဒီဇိုင်းဆန်းသစ်ပြီး အရည်အသွေးမြင့်မားသော လက်လီ/လက်ကား လက်ကိုင်အိတ်သစ်။');
  late final _descEn = TextEditingController(
      text: p?.descriptionEn ??
          'Quality handbag from Pont Pont Bag Shop Mandalay, available for retail and wholesale.');
  late String _category = p?.category ?? 'Crossbody';
  late String? _badge = p == null ? 'New Arrival' : p!.badge;
  late List<ProductColor> _colors = List.of(p?.colors ??
      const [
        ProductColor(name: 'Classic Black', hex: '#1C1917'),
        ProductColor(name: 'Caramel Tan', hex: '#9C5B34'),
        ProductColor(name: 'Cream Ivory', hex: '#F5EFE6'),
      ]);
  bool _saving = false;

  bool get _isEdit => p != null;

  @override
  void dispose() {
    for (final c in [
      _nameEn, _nameMm, _price, _original, _wholesale, _stock, _image,
      _material, _dimensions, _descMm, _descEn,
    ]) {
      c.dispose();
    }
    super.dispose();
  }

  int? _int(TextEditingController c) => int.tryParse(c.text.trim());

  Future<void> _save() async {
    final app = appState;
    if (!_form.currentState!.validate()) return;
    if (_colors.isEmpty) {
      toast(context, app.t('Add at least one color', 'အရောင် အနည်းဆုံး ၁ ခု ထည့်ပါ'),
          error: true);
      return;
    }
    final nameEn = _nameEn.text.trim();
    final product = Product(
      id: p?.id ?? 'pp-bag-${DateTime.now().millisecondsSinceEpoch}',
      nameEn: nameEn,
      nameMm: _nameMm.text.trim().isEmpty ? nameEn : _nameMm.text.trim(),
      category: _category,
      categoryMm: _category,
      price: _int(_price) ?? 0,
      originalPrice: _int(_original),
      wholesalePrice: _int(_wholesale),
      image: _image.text.trim(),
      colors: _colors,
      badge: _badge,
      rating: p?.rating ?? 5.0,
      reviewsCount: p?.reviewsCount ?? 1,
      stock: _int(_stock) ?? 0,
      material: _material.text.trim(),
      dimensions: _dimensions.text.trim(),
      descriptionEn: _descEn.text.trim(),
      descriptionMm: _descMm.text.trim(),
    );
    setState(() => _saving = true);
    final ok = await adminRun(
      context,
      (a) => _isEdit ? a.updateProduct(product) : a.addProduct(product),
      _isEdit
          ? app.t('Product updated', 'ပြင်ဆင်ပြီးပါပြီ')
          : app.t('New handbag added', 'အိတ်အသစ် ထည့်ပြီးပါပြီ'),
    );
    if (!mounted) return;
    setState(() => _saving = false);
    if (ok) Navigator.pop(context);
  }

  Future<void> _addColor() async {
    final app = appState;
    final name = TextEditingController();
    final hex = TextEditingController(text: '#');
    final result = await showDialog<ProductColor>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(app.t('Add Color', 'အရောင် ထည့်ရန်')),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          TextField(
              controller: name,
              decoration: InputDecoration(labelText: app.t('Name', 'အမည်'))),
          const SizedBox(height: 8),
          TextField(
              controller: hex,
              decoration: const InputDecoration(
                  labelText: 'Hex', hintText: '#1C1917')),
        ]),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: Text(app.t('Cancel', 'မလုပ်တော့ပါ'))),
          FilledButton(
            onPressed: () {
              if (name.text.trim().isEmpty) return;
              Navigator.pop(
                  ctx,
                  ProductColor(
                      name: name.text.trim(),
                      hex: RegExp(r'^#[0-9a-fA-F]{6}$').hasMatch(hex.text.trim())
                          ? hex.text.trim()
                          : '#78350F'));
            },
            child: const Text('OK'),
          ),
        ],
      ),
    );
    if (result != null) setState(() => _colors = [..._colors, result]);
  }

  @override
  Widget build(BuildContext context) {
    final app = appState;
    final cats = (app.data?.categories ?? []).where((c) => c.id != 'All').toList();
    if (!cats.any((c) => c.id == _category) && cats.isNotEmpty && !_isEdit) {
      _category = cats.first.id;
    }
    String? req(String? v) => (v == null || v.trim().isEmpty)
        ? app.t('Required', 'ဖြည့်ရန်လိုအပ်ပါသည်')
        : null;
    String? number(String? v) {
      if (v == null || v.trim().isEmpty) return null;
      return int.tryParse(v.trim()) == null
          ? app.t('Numbers only', 'ဂဏန်းသာ ထည့်ပါ')
          : null;
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(_isEdit
            ? app.t('Edit Bag', 'အိတ် ပြင်ဆင်ရန်')
            : app.t('Add New Bag', 'အိတ်အသစ် ထည့်ရန်')),
      ),
      body: Form(
        key: _form,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            if (_image.text.trim().isNotEmpty)
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: AspectRatio(
                    aspectRatio: 16 / 9, child: AppImage(_image.text.trim())),
              ),
            const SizedBox(height: 8),
            TextFormField(
              controller: _image,
              keyboardType: TextInputType.url,
              decoration: InputDecoration(
                  labelText: app.t('Image URL', 'ပုံ URL'),
                  helperText: 'https://...'),
              onChanged: (_) => setState(() {}),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _nameEn,
              decoration: InputDecoration(labelText: app.t('Name (English)', 'အမည် (English)')),
              validator: req,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _nameMm,
              decoration: InputDecoration(labelText: app.t('Name (Myanmar)', 'အမည် (မြန်မာ)')),
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              value: cats.any((c) => c.id == _category) ? _category : null,
              isExpanded: true,
              decoration: InputDecoration(labelText: app.t('Category', 'အမျိုးအစား')),
              items: cats
                  .map((c) => DropdownMenuItem(value: c.id, child: Text(c.labelEn)))
                  .toList(),
              onChanged: (v) => setState(() => _category = v ?? _category),
            ),
            const SizedBox(height: 12),
            Row(children: [
              Expanded(
                child: TextFormField(
                  controller: _price,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(labelText: app.t('Price (Ks)', 'ဈေးနှုန်း (Ks)')),
                  validator: (v) => req(v) ?? number(v),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: TextFormField(
                  controller: _original,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(labelText: app.t('Original price', 'မူလဈေး')),
                  validator: number,
                ),
              ),
            ]),
            const SizedBox(height: 12),
            Row(children: [
              Expanded(
                child: TextFormField(
                  controller: _wholesale,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(labelText: app.t('Wholesale price', 'လက်ကားဈေး')),
                  validator: number,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: TextFormField(
                  controller: _stock,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(labelText: app.t('Stock', 'လက်ကျန်')),
                  validator: (v) => req(v) ?? number(v),
                ),
              ),
            ]),
            const SizedBox(height: 12),
            DropdownButtonFormField<String?>(
              value: kBadges.contains(_badge) ? _badge : null,
              decoration: const InputDecoration(labelText: 'Badge'),
              items: [
                DropdownMenuItem(value: null, child: Text(app.t('None', 'မရှိ'))),
                ...kBadges.map((b) => DropdownMenuItem(value: b, child: Text(b))),
              ],
              onChanged: (v) => setState(() => _badge = v),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _material,
              decoration: InputDecoration(labelText: app.t('Material', 'ပစ္စည်း')),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _dimensions,
              decoration: InputDecoration(labelText: app.t('Dimensions', 'အရွယ်အစား')),
            ),
            SectionTitle(app.t('Colors', 'အရောင်များ')),
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: [
                ..._colors.map((c) => InputChip(
                      avatar: CircleAvatar(backgroundColor: hexColor(c.hex)),
                      label: Text(c.name),
                      onDeleted: () => setState(
                          () => _colors = _colors.where((x) => x != c).toList()),
                    )),
                ActionChip(
                  avatar: const Icon(Icons.add, size: 18),
                  label: Text(app.t('Add', 'ထည့်')),
                  onPressed: _addColor,
                ),
              ],
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _descMm,
              maxLines: 3,
              decoration: InputDecoration(labelText: app.t('Description (Myanmar)', 'ဖော်ပြချက် (မြန်မာ)')),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _descEn,
              maxLines: 3,
              decoration: InputDecoration(labelText: app.t('Description (English)', 'ဖော်ပြချက် (English)')),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _saving ? null : _save,
              child: _saving
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2))
                  : Text(_isEdit
                      ? app.t('Save Changes', 'ပြင်ဆင်ချက် သိမ်းမည်')
                      : app.t('Add Product', 'အိတ်အသစ် ထည့်မည်')),
            ),
          ],
        ),
      ),
    );
  }
}
