import 'package:flutter/material.dart';

import '../config/constants.dart';
import '../models/shop_data.dart';
import '../services/app_state.dart';
import '../widgets/common.dart';
import 'orders_screen.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});
  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final _form = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _phone = TextEditingController();
  final _address = TextEditingController();
  final _note = TextEditingController();
  final _txRef = TextEditingController();
  final _promo = TextEditingController();
  String _city = kCities.first.name;
  String _payment = 'KPay';
  bool _promoApplied = false;
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    final u = appState.user;
    if (u != null) {
      _name.text = u.name;
      _phone.text = u.phone;
      _address.text = u.address;
      _city = cityByName(u.city).name;
    }
  }

  @override
  void dispose() {
    for (final c in [_name, _phone, _address, _note, _txRef, _promo]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _submit() async {
    final app = appState;
    if (!_form.currentState!.validate()) return;
    setState(() => _submitting = true);
    try {
      final res = await app.run((a) => a.createOrder(
            customerName: _name.text.trim(),
            phone: _phone.text.trim(),
            city: _city,
            address: _address.text.trim(),
            paymentMethod: _payment,
            cartItems: List.of(app.cart),
            promoApplied: _promoApplied,
            transactionRef: _payment == 'COD' ? null : _txRef.text.trim(),
            note: _note.text.trim(),
            userEmail: app.user?.email,
          ));
      app.clearCart();
      if (!mounted) return;
      await _showSuccess(res.order);
    } catch (e) {
      if (mounted) toast(context, e.toString(), error: true);
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  Future<void> _showSuccess(Order? order) async {
    final app = appState;
    await showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        icon: const Icon(Icons.check_circle, color: Colors.green, size: 56),
        title: Text(app.t('Order Placed!', 'အော်ဒါတင်ပြီးပါပြီ!')),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          if (order != null) ...[
            Text('${app.t('Order ID', 'အော်ဒါနံပါတ်')}: ${order.id}',
                style: const TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text('${app.t('Total', 'စုစုပေါင်း')}: ${mmk(order.total)}'),
          ],
          const SizedBox(height: 8),
          Text(app.t('We will contact you shortly to confirm.',
              'မကြာမီ ဖုန်းဖြင့် ဆက်သွယ် အတည်ပြုပေးပါမည်။')),
        ]),
        actions: [
          if (app.isLoggedIn)
            TextButton(
              onPressed: () {
                Navigator.pop(ctx);
                Navigator.pushReplacement(context,
                    MaterialPageRoute(builder: (_) => const OrdersScreen()));
              },
              child: Text(app.t('My Orders', 'ကျွန်ုပ်၏ အော်ဒါများ')),
            ),
          FilledButton(
            onPressed: () {
              Navigator.pop(ctx);
              Navigator.pop(context);
            },
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: appState,
      builder: (context, _) {
        final app = appState;
        final subtotal = app.cartSubtotal;
        final discount = _promoApplied ? (subtotal * 0.1).round() : 0;
        final fee = subtotal - discount >= AppConfig.freeDeliveryThreshold
            ? 0
            : cityByName(_city).fee;
        final total = subtotal - discount + fee;
        String? req(String? v) => (v == null || v.trim().isEmpty)
            ? app.t('Required', 'ဖြည့်ရန်လိုအပ်ပါသည်')
            : null;

        return Scaffold(
          appBar: AppBar(title: Text(app.t('Checkout', 'အော်ဒါတင်ရန်'))),
          body: Form(
            key: _form,
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                if (!app.isLoggedIn)
                  Card(
                    color: Colors.amber.shade50,
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Text(app.t(
                          'Tip: Log in to track your orders in "My Orders".',
                          'အကောင့်ဝင်ထားပါက "ကျွန်ုပ်၏ အော်ဒါများ" တွင် ခြေရာခံနိုင်ပါသည်။')),
                    ),
                  ),
                SectionTitle(app.t('Delivery Info', 'ပို့ဆောင်ရမည့် လိပ်စာ')),
                TextFormField(
                  controller: _name,
                  decoration: InputDecoration(labelText: app.t('Name', 'အမည်')),
                  validator: req,
                ),
                const SizedBox(height: 10),
                TextFormField(
                  controller: _phone,
                  keyboardType: TextInputType.phone,
                  decoration:
                      InputDecoration(labelText: app.t('Phone', 'ဖုန်းနံပါတ်')),
                  validator: req,
                ),
                const SizedBox(height: 10),
                DropdownButtonFormField<String>(
                  value: _city,
                  isExpanded: true,
                  decoration: InputDecoration(labelText: app.t('City', 'မြို့')),
                  items: kCities
                      .map((c) => DropdownMenuItem(
                          value: c.name,
                          child: Text('${c.name} (${mmk(c.fee)})',
                              overflow: TextOverflow.ellipsis)))
                      .toList(),
                  onChanged: (v) => setState(() => _city = v ?? _city),
                ),
                const SizedBox(height: 10),
                TextFormField(
                  controller: _address,
                  maxLines: 2,
                  decoration: InputDecoration(
                      labelText: app.t('Full Address', 'လိပ်စာ အပြည့်အစုံ')),
                  validator: req,
                ),
                const SizedBox(height: 10),
                TextFormField(
                  controller: _note,
                  decoration: InputDecoration(
                      labelText: app.t('Note (optional)', 'မှတ်ချက် (ရွေးချယ်ရန်)')),
                ),
                SectionTitle(app.t('Payment', 'ငွေပေးချေမှု')),
                SegmentedButton<String>(
                  segments: [
                    const ButtonSegment(value: 'KPay', label: Text('KPay')),
                    const ButtonSegment(value: 'WavePay', label: Text('WavePay')),
                    ButtonSegment(
                        value: 'COD',
                        label: Text(app.t('COD', 'အိမ်ရောက်ငွေချေ'))),
                  ],
                  selected: {_payment},
                  onSelectionChanged: (s) => setState(() => _payment = s.first),
                ),
                if (_payment != 'COD') ...[
                  const SizedBox(height: 10),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('$_payment: ${ShopInfo.paymentAccounts}',
                              style:
                                  const TextStyle(fontWeight: FontWeight.bold)),
                          Text('${app.t('Name', 'အမည်')}: ${ShopInfo.paymentAccountName}'),
                          Text(app.t(
                              'Transfer ${mmk(total)} and enter the last 6 digits of the transaction ID.',
                              '${mmk(total)} လွှဲပြီး Transaction ID နောက်ဆုံး ၆ လုံး ထည့်ပါ။'),
                              style: const TextStyle(fontSize: 12)),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),
                  TextFormField(
                    controller: _txRef,
                    maxLength: 20,
                    decoration: InputDecoration(
                        labelText: app.t('Transaction ID (last 6 digits)',
                            'Transaction ID (နောက်ဆုံး ၆ လုံး)')),
                    validator: (v) => _payment == 'COD' ? null : req(v),
                  ),
                ],
                SectionTitle(app.t('Promo Code', 'လျှော့ဈေးကူပွန်')),
                Row(children: [
                  Expanded(
                    child: TextField(
                      controller: _promo,
                      enabled: !_promoApplied,
                      decoration: InputDecoration(
                          hintText: AppConfig.promoCode, isDense: true),
                    ),
                  ),
                  const SizedBox(width: 8),
                  OutlinedButton(
                    onPressed: () {
                      if (_promoApplied) {
                        setState(() => _promoApplied = false);
                        return;
                      }
                      final ok = _promo.text.trim().toUpperCase() ==
                          AppConfig.promoCode;
                      setState(() => _promoApplied = ok);
                      toast(
                          context,
                          ok
                              ? app.t('10% discount applied!',
                                  '10% လျှော့ဈေး အသုံးပြုပြီးပါပြီ!')
                              : app.t('Invalid promo code',
                                  'ကူပွန်ကုဒ် မှားယွင်းနေပါသည်'),
                          error: !ok);
                    },
                    child: Text(_promoApplied
                        ? app.t('Remove', 'ဖယ်ရှား')
                        : app.t('Apply', 'သုံးမည်')),
                  ),
                ]),
                SectionTitle(app.t('Order Summary', 'အော်ဒါ အနှစ်ချုပ်')),
                ...app.cart.map((i) => _line(
                    '${app.isEn ? i.product.nameEn : i.product.nameMm} (${i.selectedColor.name}) ×${i.quantity}',
                    mmk(i.totalPrice))),
                const Divider(),
                _line(app.t('Subtotal', 'ကျသင့်ငွေ'), mmk(subtotal)),
                if (discount > 0)
                  _line(app.t('Discount', 'လျှော့ဈေး'), '- ${mmk(discount)}'),
                _line(app.t('Delivery', 'ပို့ဆောင်ခ'),
                    fee == 0 ? app.t('FREE', 'အခမဲ့') : mmk(fee)),
                const Divider(),
                _line(app.t('Total', 'စုစုပေါင်း'), mmk(total), bold: true),
                const SizedBox(height: 80),
              ],
            ),
          ),
          bottomNavigationBar: SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: ElevatedButton(
                onPressed: _submitting || app.cart.isEmpty ? null : _submit,
                child: _submitting
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2))
                    : Text(
                        '${app.t('Place Order', 'အော်ဒါတင်မည်')} • ${mmk(total)}'),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _line(String k, String v, {bool bold = false}) {
    final style = TextStyle(
        fontWeight: bold ? FontWeight.bold : FontWeight.normal,
        fontSize: bold ? 16 : 14);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(children: [
        Expanded(child: Text(k, style: style)),
        Text(v, style: style),
      ]),
    );
  }
}
