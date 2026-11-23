import 'package:flutter/material.dart';

import '../config/constants.dart';
import '../config/themes.dart';
import '../services/app_state.dart';
import '../widgets/common.dart';
import 'auth_screen.dart';
import 'orders_screen.dart';
import 'profile_edit_screen.dart';
import 'settings_screen.dart';

class AccountScreen extends StatelessWidget {
  const AccountScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: appState,
      builder: (context, _) {
        final app = appState;
        final user = app.user;
        final theme = themeById(app.data?.theme);

        return Scaffold(
          appBar: AppBar(
            title: Text(app.t('My Account', 'ကျွန်ုပ်၏ အကောင့်')),
            actions: const [LangToggle()],
          ),
          body: RefreshIndicator(
            onRefresh: app.refresh,
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                if (user == null)
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(children: [
                        const Icon(Icons.account_circle_outlined, size: 72),
                        const SizedBox(height: 8),
                        Text(
                          app.t('Log in to manage your profile and orders',
                              'Profile နှင့် အော်ဒါများ ကြည့်ရန် အကောင့်ဝင်ပါ'),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 16),
                        Row(children: [
                          Expanded(
                            child: ElevatedButton(
                              onPressed: () => Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                      builder: (_) => const AuthScreen())),
                              child: Text(app.t('Login', 'အကောင့်ဝင်')),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: OutlinedButton(
                              onPressed: () => Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                      builder: (_) => const AuthScreen(
                                          startWithRegister: true))),
                              child: Text(app.t('Sign Up', 'အကောင့်ဖွင့်')),
                            ),
                          ),
                        ]),
                      ]),
                    ),
                  )
                else
                  Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      gradient: theme.heroGradient,
                      borderRadius: BorderRadius.circular(theme.radius),
                    ),
                    child: Row(children: [
                      CircleAvatar(
                        radius: 28,
                        backgroundColor: theme.accent,
                        child: Text(
                          user.name.isNotEmpty
                              ? user.name[0].toUpperCase()
                              : '?',
                          style: const TextStyle(
                              fontSize: 24, fontWeight: FontWeight.bold),
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(user.name,
                                style: TextStyle(
                                    color: theme.onHero,
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold)),
                            Text(user.email,
                                style: const TextStyle(color: Colors.white70)),
                            Text(user.phone,
                                style: const TextStyle(color: Colors.white70)),
                            if (user.isAdmin)
                              Container(
                                margin: const EdgeInsets.only(top: 4),
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 8, vertical: 2),
                                color: theme.accent,
                                child: const Text('ADMIN',
                                    style: TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold)),
                              ),
                          ],
                        ),
                      ),
                    ]),
                  ),
                const SizedBox(height: 12),
                if (user != null) ...[
                  _tile(
                    context,
                    Icons.receipt_long_outlined,
                    app.t('My Orders', 'ကျွန်ုပ်၏ အော်ဒါများ'),
                    trailing: '${app.data?.orders.length ?? 0}',
                    onTap: () => Navigator.push(context,
                        MaterialPageRoute(builder: (_) => const OrdersScreen())),
                  ),
                  _tile(
                    context,
                    Icons.edit_outlined,
                    app.t('Edit Profile & Password',
                        'Profile နှင့် စကားဝှက် ပြင်ရန်'),
                    onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (_) => const ProfileEditScreen())),
                  ),
                ],
                _tile(
                  context,
                  Icons.favorite_border,
                  app.t('Wishlist', 'နှစ်သက်သော အိတ်များ'),
                  trailing: '${app.wishlist.length}',
                  onTap: () => _showWishlist(context),
                ),
                _tile(
                  context,
                  Icons.settings_outlined,
                  app.t('Settings', 'ဆက်တင်များ'),
                  onTap: () => Navigator.push(context,
                      MaterialPageRoute(builder: (_) => const SettingsScreen())),
                ),
                SectionTitle(app.t('Contact Us', 'ဆက်သွယ်ရန်')),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(ShopInfo.ownerName,
                            style:
                                const TextStyle(fontWeight: FontWeight.bold)),
                        const SizedBox(height: 4),
                        ...ShopInfo.phones.map((p) => Row(children: [
                              const Icon(Icons.phone, size: 16),
                              const SizedBox(width: 6),
                              SelectableText(p),
                            ])),
                        Row(children: [
                          const Icon(Icons.email_outlined, size: 16),
                          const SizedBox(width: 6),
                          SelectableText(ShopInfo.email),
                        ]),
                        Row(children: [
                          const Icon(Icons.schedule, size: 16),
                          const SizedBox(width: 6),
                          Expanded(
                              child: Text(app.isEn
                                  ? ShopInfo.hoursEn
                                  : ShopInfo.hoursMm)),
                        ]),
                        const Divider(),
                        ...ShopInfo.branches.map((b) => Padding(
                              padding: const EdgeInsets.symmetric(vertical: 4),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Icon(Icons.store, size: 18),
                                  const SizedBox(width: 6),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(app.isEn ? b.nameEn : b.nameMm,
                                            style: const TextStyle(
                                                fontWeight: FontWeight.w600)),
                                        Text(
                                            app.isEn
                                                ? b.addressEn
                                                : b.addressMm,
                                            style:
                                                const TextStyle(fontSize: 12)),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            )),
                      ],
                    ),
                  ),
                ),
                if (user != null) ...[
                  const SizedBox(height: 16),
                  OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.red,
                        padding: const EdgeInsets.all(14)),
                    onPressed: () async {
                      if (await confirmDialog(context,
                          app.t('Log out?', 'အကောင့်မှ ထွက်မလား?'))) {
                        await app.logout();
                        if (context.mounted) {
                          toast(context,
                              app.t('Logged out', 'အကောင့်မှ ထွက်ပြီးပါပြီ'));
                        }
                      }
                    },
                    icon: const Icon(Icons.logout),
                    label: Text(app.t('Logout', 'အကောင့်မှ ထွက်မည်')),
                  ),
                ],
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _tile(BuildContext context, IconData icon, String title,
      {String? trailing, VoidCallback? onTap}) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(icon),
        title: Text(title),
        trailing: Row(mainAxisSize: MainAxisSize.min, children: [
          if (trailing != null) Text(trailing),
          const Icon(Icons.chevron_right),
        ]),
        onTap: onTap,
      ),
    );
  }

  void _showWishlist(BuildContext context) {
    final app = appState;
    showModalBottomSheet(
      context: context,
      showDragHandle: true,
      builder: (ctx) => ListenableBuilder(
        listenable: app,
        builder: (ctx, _) {
          final items = (app.data?.products ?? [])
              .where((p) => app.wishlist.contains(p.id))
              .toList();
          if (items.isEmpty) {
            return Padding(
              padding: const EdgeInsets.all(32),
              child: Text(app.t('No items in wishlist',
                  'နှစ်သက်သော အိတ် မရှိသေးပါ')),
            );
          }
          return ListView(
            shrinkWrap: true,
            children: items
                .map((p) => ListTile(
                      leading: ClipRRect(
                        borderRadius: BorderRadius.circular(6),
                        child: AppImage(p.image, width: 48, height: 48),
                      ),
                      title: Text(app.isEn ? p.nameEn : p.nameMm),
                      subtitle: Text(mmk(p.price)),
                      trailing: Row(mainAxisSize: MainAxisSize.min, children: [
                        IconButton(
                          icon: const Icon(Icons.add_shopping_cart),
                          onPressed: p.stock <= 0
                              ? null
                              : () {
                                  app.addToCart(p, p.colors.first, 1);
                                  toast(ctx,
                                      app.t('Added to cart', 'ထည့်ပြီးပါပြီ'));
                                },
                        ),
                        IconButton(
                          icon: const Icon(Icons.favorite, color: Colors.red),
                          onPressed: () => app.toggleWishlist(p.id),
                        ),
                      ]),
                    ))
                .toList(),
          );
        },
      ),
    );
  }
}
