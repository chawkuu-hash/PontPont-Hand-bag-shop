import 'package:flutter/material.dart';

import '../config/constants.dart';
import '../services/app_state.dart';
import '../widgets/common.dart';
import 'checkout_screen.dart';

class CartScreen extends StatelessWidget {
  final VoidCallback onContinueShopping;
  const CartScreen({super.key, required this.onContinueShopping});

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: appState,
      builder: (context, _) {
        final app = appState;
        final subtotal = app.cartSubtotal;
        final remaining = AppConfig.freeDeliveryThreshold - subtotal;

        return Scaffold(
          appBar: AppBar(
            title: Text(app.t('Shopping Bag', 'ဈေးခြင်း')),
            actions: [
              if (app.cart.isNotEmpty)
                IconButton(
                  tooltip: app.t('Clear', 'အားလုံးဖျက်'),
                  icon: const Icon(Icons.delete_sweep_outlined),
                  onPressed: () async {
                    if (await confirmDialog(context,
                        app.t('Clear the cart?', 'ဈေးခြင်းကို ရှင်းမလား?'))) {
                      app.clearCart();
                    }
                  },
                ),
            ],
          ),
          body: app.cart.isEmpty
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(mainAxisSize: MainAxisSize.min, children: [
                      const Icon(Icons.shopping_bag_outlined,
                          size: 72, color: Colors.grey),
                      const SizedBox(height: 12),
                      Text(app.t('Your bag is empty',
                          'ဈေးခြင်းထဲတွင် ပစ္စည်းမရှိသေးပါ')),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: onContinueShopping,
                        child: Text(app.t('Start Shopping', 'ဈေးဝယ်မည်')),
                      ),
                    ]),
                  ),
                )
              : ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: remaining <= 0
                            ? Colors.green.shade50
                            : Colors.amber.shade50,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(remaining <= 0
                          ? app.t('🎉 You get FREE delivery!',
                              '🎉 အခမဲ့ ပို့ဆောင်ပေးပါမည်!')
                          : app.t(
                              'Add ${mmk(remaining)} more for free delivery',
                              'နောက်ထပ် ${mmk(remaining)} ဝယ်ပါက အခမဲ့ပို့ဆောင်ပေးပါမည်')),
                    ),
                    const SizedBox(height: 12),
                    ...app.cart.map((item) => Card(
                          margin: const EdgeInsets.only(bottom: 10),
                          child: Padding(
                            padding: const EdgeInsets.all(10),
                            child: Row(children: [
                              ClipRRect(
                                borderRadius: BorderRadius.circular(8),
                                child: AppImage(item.product.image,
                                    width: 72, height: 72),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                        app.isEn
                                            ? item.product.nameEn
                                            : item.product.nameMm,
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
                                        style: const TextStyle(
                                            fontWeight: FontWeight.bold)),
                                    Text(item.selectedColor.name,
                                        style: TextStyle(
                                            fontSize: 12,
                                            color: Colors.grey.shade600)),
                                    Text(mmk(item.totalPrice),
                                        style: const TextStyle(
                                            fontWeight: FontWeight.w600)),
                                  ],
                                ),
                              ),
                              Column(children: [
                                Row(mainAxisSize: MainAxisSize.min, children: [
                                  IconButton(
                                    visualDensity: VisualDensity.compact,
                                    icon: const Icon(Icons.remove_circle_outline),
                                    onPressed: () =>
                                        app.setQty(item, item.quantity - 1),
                                  ),
                                  Text('${item.quantity}'),
                                  IconButton(
                                    visualDensity: VisualDensity.compact,
                                    icon: const Icon(Icons.add_circle_outline),
                                    onPressed: () =>
                                        app.setQty(item, item.quantity + 1),
                                  ),
                                ]),
                                TextButton(
                                  onPressed: () => app.removeFromCart(item),
                                  child: Text(app.t('Remove', 'ဖယ်ရှားမည်'),
                                      style:
                                          const TextStyle(color: Colors.red)),
                                ),
                              ]),
                            ]),
                          ),
                        )),
                  ],
                ),
          bottomNavigationBar: app.cart.isEmpty
              ? null
              : SafeArea(
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Row(children: [
                      Expanded(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(app.t('Subtotal', 'စုစုပေါင်း'),
                                style: const TextStyle(fontSize: 12)),
                            Text(mmk(subtotal),
                                style: const TextStyle(
                                    fontSize: 18, fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ),
                      ElevatedButton.icon(
                        onPressed: () => Navigator.push(
                            context,
                            MaterialPageRoute(
                                builder: (_) => const CheckoutScreen())),
                        icon: const Icon(Icons.lock_outline),
                        label: Text(app.t('Checkout', 'အော်ဒါတင်မည်')),
                      ),
                    ]),
                  ),
                ),
        );
      },
    );
  }
}
