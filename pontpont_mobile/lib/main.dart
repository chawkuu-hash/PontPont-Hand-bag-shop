import 'package:flutter/material.dart';

import 'config/themes.dart';
import 'screens/account_screen.dart';
import 'screens/admin/admin_dashboard.dart';
import 'screens/announcements_screen.dart';
import 'screens/cart_screen.dart';
import 'screens/home_screen.dart';
import 'services/app_state.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const PontPontApp());
  appState.init();
}

class PontPontApp extends StatelessWidget {
  const PontPontApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: appState,
      builder: (context, _) {
        final theme = themeById(appState.data?.theme);
        return MaterialApp(
          title: 'PontPont Handbag Boutique',
          debugShowCheckedModeBanner: false,
          theme: theme.toThemeData(),
          home: const AppShell(),
        );
      },
    );
  }
}

class AppShell extends StatefulWidget {
  const AppShell({super.key});
  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  int _index = 0;

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: appState,
      builder: (context, _) {
        final app = appState;
        final pages = <Widget>[
          HomeScreen(onOpenCart: () => setState(() => _index = 2)),
          const AnnouncementsScreen(),
          CartScreen(onContinueShopping: () => setState(() => _index = 0)),
          const AccountScreen(),
          if (app.isAdmin) const AdminDashboard(),
        ];
        if (_index >= pages.length) _index = 0;

        return Scaffold(
          body: IndexedStack(index: _index, children: pages),
          bottomNavigationBar: NavigationBar(
            selectedIndex: _index,
            onDestinationSelected: (i) => setState(() => _index = i),
            destinations: [
              NavigationDestination(
                icon: const Icon(Icons.storefront_outlined),
                selectedIcon: const Icon(Icons.storefront),
                label: app.t('Shop', 'ဆိုင်'),
              ),
              NavigationDestination(
                icon: const Icon(Icons.campaign_outlined),
                selectedIcon: const Icon(Icons.campaign),
                label: app.t('News', 'ကြေညာချက်'),
              ),
              NavigationDestination(
                icon: Badge(
                  isLabelVisible: app.cartCount > 0,
                  label: Text('${app.cartCount}'),
                  child: const Icon(Icons.shopping_bag_outlined),
                ),
                selectedIcon: Badge(
                  isLabelVisible: app.cartCount > 0,
                  label: Text('${app.cartCount}'),
                  child: const Icon(Icons.shopping_bag),
                ),
                label: app.t('Cart', 'ခြင်း'),
              ),
              NavigationDestination(
                icon: const Icon(Icons.person_outline),
                selectedIcon: const Icon(Icons.person),
                label: app.isLoggedIn
                    ? app.t('Account', 'အကောင့်')
                    : app.t('Login', 'အကောင့်ဝင်'),
              ),
              if (app.isAdmin)
                NavigationDestination(
                  icon: const Icon(Icons.admin_panel_settings_outlined),
                  selectedIcon: const Icon(Icons.admin_panel_settings),
                  label: 'Admin',
                ),
            ],
          ),
        );
      },
    );
  }
}
