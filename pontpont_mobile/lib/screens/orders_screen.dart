import 'package:flutter/material.dart';

import '../models/shop_data.dart';
import '../services/app_state.dart';
import '../widgets/common.dart';

/// Customer "My Orders" list (backend returns only the user's own orders).
class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key});
  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  String _query = '';

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: appState,
      builder: (context, _) {
        final app = appState;
        final q = _query.trim().toLowerCase();
        final orders = (app.data?.orders ?? [])
            .where((o) =>
                q.isEmpty ||
                o.id.toLowerCase().contains(q) ||
                o.items.any((i) => i.nameEn.toLowerCase().contains(q) ||
                    i.nameMm.contains(q)))
            .toList();
        return Scaffold(
          appBar: AppBar(title: Text(app.t('My Orders', 'ကျွန်ုပ်၏ အော်ဒါများ'))),
          body: RefreshIndicator(
            onRefresh: app.refresh,
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                TextField(
                  onChanged: (v) => setState(() => _query = v),
                  decoration: InputDecoration(
                    hintText: app.t('Search by order ID or item',
                        'အော်ဒါနံပါတ် သို့မဟုတ် ပစ္စည်းအမည်'),
                    prefixIcon: const Icon(Icons.search),
                    isDense: true,
                  ),
                ),
                const SizedBox(height: 12),
                if (orders.isEmpty)
                  Padding(
                    padding: const EdgeInsets.all(32),
                    child: Center(
                        child: Text(app.t('No orders yet', 'အော်ဒါ မရှိသေးပါ'))),
                  ),
                ...orders.map((o) => OrderCard(order: o)),
              ],
            ),
          ),
        );
      },
    );
  }
}

/// Expandable order card. If [adminActions] is provided it's shown inside.
class OrderCard extends StatelessWidget {
  final Order order;
  final Widget? adminActions;
  const OrderCard({super.key, required this.order, this.adminActions});

  @override
  Widget build(BuildContext context) {
    final app = appState;
    final o = order;
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      clipBehavior: Clip.antiAlias,
      child: ExpansionTile(
        title: Row(children: [
          Expanded(
              child: Text(o.id,
                  style: const TextStyle(fontWeight: FontWeight.bold))),
          StatusChip(o.status),
        ]),
        subtitle: Text(
            '${fmtDate(o.createdAt)}\n${mmk(o.total)} • ${o.paymentMethod} • ${o.items.length} ${app.t('items', 'ခု')}'),

        childrenPadding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
        expandedCrossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ...o.items.map((i) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: Row(children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(6),
                    child: AppImage(i.image, width: 44, height: 44),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                        '${app.isEn ? i.nameEn : i.nameMm}\n${i.selectedColor} × ${i.quantity}',
                        style: const TextStyle(fontSize: 13)),
                  ),
                  Text(mmk(i.price * i.quantity)),
                ]),
              )),
          const Divider(),
          _kv(app.t('Customer', 'ဝယ်သူ'), o.customerName),
          _kv(app.t('Phone', 'ဖုန်း'), o.phone),
          _kv(app.t('City', 'မြို့'), o.city),
          _kv(app.t('Address', 'လိပ်စာ'), o.address),
          if (o.note != null && o.note!.isNotEmpty)
            _kv(app.t('Note', 'မှတ်ချက်'), o.note!),
          if (o.transactionRef != null && o.transactionRef!.isNotEmpty)
            _kv('Txn Ref', o.transactionRef!),
          if (o.userEmail != null) _kv('Email', o.userEmail!),
          const Divider(),
          _kv(app.t('Subtotal', 'ကျသင့်ငွေ'), mmk(o.subtotal)),
          if (o.discount > 0)
            _kv(app.t('Discount', 'လျှော့ဈေး'), '- ${mmk(o.discount)}'),
          _kv(app.t('Delivery', 'ပို့ဆောင်ခ'),
              o.deliveryFee == 0 ? app.t('FREE', 'အခမဲ့') : mmk(o.deliveryFee)),
          _kv(app.t('Total', 'စုစုပေါင်း'), mmk(o.total), bold: true),
          if (adminActions != null) ...[
            const SizedBox(height: 8),
            adminActions!,
          ],
        ],
      ),
    );
  }

  Widget _kv(String k, String v, {bool bold = false}) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 2),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          SizedBox(
              width: 90,
              child: Text(k,
                  style: const TextStyle(fontSize: 12, color: Colors.grey))),
          Expanded(
              child: Text(v,
                  style: TextStyle(
                      fontWeight: bold ? FontWeight.bold : FontWeight.normal))),
        ]),
      );
}
