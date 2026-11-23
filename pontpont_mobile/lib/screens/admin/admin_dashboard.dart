import 'package:flutter/material.dart';

import '../../config/constants.dart';
import '../../config/themes.dart';
import '../../models/shop_data.dart';
import '../../services/api_service.dart';
import '../../services/app_state.dart';
import '../../widgets/common.dart';
import '../announcements_screen.dart';
import '../orders_screen.dart';
import 'product_form_screen.dart';

/// Runs an admin action with a toast on success/failure.
Future<bool> adminRun(BuildContext context,
    Future<ActionResult> Function(ApiService) fn, String successMsg) async {
  try {
    await appState.run(fn);
    if (context.mounted) toast(context, successMsg);
    return true;
  } catch (e) {
    if (context.mounted) toast(context, e.toString(), error: true);
    return false;
  }
}

class AdminDashboard extends StatelessWidget {
  const AdminDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    final app = appState;
    return DefaultTabController(
      length: 6,
      child: ListenableBuilder(
        listenable: app,
        builder: (context, _) => Scaffold(
          appBar: AppBar(
            title: Text(app.t('Admin Dashboard', 'Admin စီမံခန့်ခွဲမှု')),
            actions: [
              IconButton(
                  onPressed: app.refresh, icon: const Icon(Icons.refresh)),
            ],
            bottom: TabBar(
              isScrollable: true,
              tabAlignment: TabAlignment.start,
              labelColor: Theme.of(context).appBarTheme.foregroundColor,
              unselectedLabelColor: Colors.white60,
              indicatorColor: themeById(app.data?.theme).accent,
              tabs: [
                Tab(text: app.t('Orders', 'အော်ဒါများ')),
                Tab(text: app.t('Products', 'ပစ္စည်းများ')),
                Tab(text: app.t('Categories', 'အမျိုးအစား')),
                Tab(text: app.t('Users', 'အသုံးပြုသူ')),
                Tab(text: app.t('Announcements', 'ကြေညာချက်')),
                Tab(text: app.t('Themes', 'Theme')),
              ],
            ),
          ),
          body: const TabBarView(children: [
            _OrdersTab(),
            _ProductsTab(),
            _CategoriesTab(),
            _UsersTab(),
            _AnnouncementsTab(),
            _ThemesTab(),
          ]),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------- Orders
class _OrdersTab extends StatefulWidget {
  const _OrdersTab();
  @override
  State<_OrdersTab> createState() => _OrdersTabState();
}

class _OrdersTabState extends State<_OrdersTab> {
  String _filter = 'All';
  String _query = '';

  @override
  Widget build(BuildContext context) {
    final app = appState;
    final all = app.data?.orders ?? [];
    final revenue = all
        .where((o) => o.status != 'Cancelled')
        .fold<int>(0, (s, o) => s + o.total);
    final pending = all.where((o) => o.status == 'Pending').length;
    final q = _query.trim().toLowerCase();
    final orders = all
        .where((o) => _filter == 'All' || o.status == _filter)
        .where((o) =>
            q.isEmpty ||
            o.id.toLowerCase().contains(q) ||
            o.customerName.toLowerCase().contains(q) ||
            o.phone.contains(q))
        .toList();

    return RefreshIndicator(
      onRefresh: app.refresh,
      child: ListView(
        padding: const EdgeInsets.all(12),
        children: [
          Row(children: [
            _stat(app.t('Revenue', 'ရောင်းရငွေ'), mmk(revenue), Icons.payments),
            _stat(app.t('Orders', 'အော်ဒါ'), '${all.length}', Icons.receipt),
          ]),
          Row(children: [
            _stat(app.t('Pending', 'စောင့်ဆဲ'), '$pending', Icons.hourglass_top),
            _stat(app.t('Products', 'ပစ္စည်း'),
                '${app.data?.products.length ?? 0}', Icons.shopping_bag),
            _stat(app.t('Users', 'အသုံးပြုသူ'), '${app.data?.usersCount ?? 0}',
                Icons.people),
          ]),
          const SizedBox(height: 8),
          TextField(
            onChanged: (v) => setState(() => _query = v),
            decoration: InputDecoration(
              hintText: app.t('Search ID, name, phone', 'ID၊ အမည်၊ ဖုန်း ရှာရန်'),
              prefixIcon: const Icon(Icons.search),
              isDense: true,
            ),
          ),
          SizedBox(
            height: 48,
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: ['All', ...kOrderStatuses]
                  .map((s) => Padding(
                        padding: const EdgeInsets.only(right: 6, top: 6),
                        child: ChoiceChip(
                          label: Text(s == 'All'
                              ? app.t('All', 'အားလုံး')
                              : statusLabel(s)),
                          selected: _filter == s,
                          onSelected: (_) => setState(() => _filter = s),
                        ),
                      ))
                  .toList(),
            ),
          ),
          const SizedBox(height: 8),
          if (orders.isEmpty)
            Padding(
              padding: const EdgeInsets.all(32),
              child: Center(child: Text(app.t('No orders', 'အော်ဒါ မရှိပါ'))),
            ),
          ...orders.map((o) => OrderCard(
                order: o,
                adminActions: Row(children: [
                  Text(app.t('Status:', 'အခြေအနေ:')),
                  const SizedBox(width: 8),
                  Expanded(
                    child: DropdownButton<String>(
                      value: o.status,
                      isExpanded: true,
                      items: kOrderStatuses
                          .map((s) => DropdownMenuItem(
                              value: s, child: Text(statusLabel(s))))
                          .toList(),
                      onChanged: (s) {
                        if (s == null || s == o.status) return;
                        adminRun(
                            context,
                            (a) => a.updateOrderStatus(o.id, s),
                            app.t('Status updated', 'အခြေအနေ ပြောင်းပြီးပါပြီ'));
                      },
                    ),
                  ),
                ]),
              )),
        ],
      ),
    );
  }

  Widget _stat(String label, String value, IconData icon) => Expanded(
        child: Card(
          margin: const EdgeInsets.all(4),
          child: Padding(
            padding: const EdgeInsets.all(10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(icon, size: 18),
                const SizedBox(height: 4),
                FittedBox(
                  child: Text(value,
                      style: const TextStyle(
                          fontSize: 16, fontWeight: FontWeight.bold)),
                ),
                Text(label, style: const TextStyle(fontSize: 11)),
              ],
            ),
          ),
        ),
      );
}

// ---------------------------------------------------------------- Products
class _ProductsTab extends StatefulWidget {
  const _ProductsTab();
  @override
  State<_ProductsTab> createState() => _ProductsTabState();
}

class _ProductsTabState extends State<_ProductsTab> {
  String _query = '';

  @override
  Widget build(BuildContext context) {
    final app = appState;
    final q = _query.toLowerCase();
    final products = (app.data?.products ?? [])
        .where((p) =>
            q.isEmpty ||
            p.nameEn.toLowerCase().contains(q) ||
            p.nameMm.contains(q) ||
            p.category.toLowerCase().contains(q))
        .toList();
    return Scaffold(
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => Navigator.push(context,
            MaterialPageRoute(builder: (_) => const ProductFormScreen())),
        icon: const Icon(Icons.add),
        label: Text(app.t('Add Bag', 'အိတ်အသစ်')),
      ),
      body: RefreshIndicator(
        onRefresh: app.refresh,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(12, 12, 12, 90),
          children: [
            TextField(
              onChanged: (v) => setState(() => _query = v),
              decoration: InputDecoration(
                hintText: app.t('Search products', 'ပစ္စည်း ရှာရန်'),
                prefixIcon: const Icon(Icons.search),
                isDense: true,
              ),
            ),
            const SizedBox(height: 8),
            ...products.map((p) => Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: ListTile(
                    leading: ClipRRect(
                      borderRadius: BorderRadius.circular(6),
                      child: AppImage(p.image, width: 52, height: 52),
                    ),
                    title: Text(app.isEn ? p.nameEn : p.nameMm,
                        maxLines: 1, overflow: TextOverflow.ellipsis),
                    subtitle: Text(
                        '${mmk(p.price)} • ${p.category}\n${app.t('Stock', 'လက်ကျန်')}: ${p.stock}${p.badge != null ? ' • ${p.badge}' : ''}',
                        style: TextStyle(
                            color: p.stock <= 3 ? Colors.red : null)),
                    isThreeLine: true,
                    trailing: Row(mainAxisSize: MainAxisSize.min, children: [
                      IconButton(
                        icon: const Icon(Icons.edit_outlined),
                        onPressed: () => Navigator.push(
                            context,
                            MaterialPageRoute(
                                builder: (_) => ProductFormScreen(product: p))),
                      ),
                      IconButton(
                        icon: const Icon(Icons.delete_outline,
                            color: Colors.red),
                        onPressed: () async {
                          if (await confirmDialog(
                              context,
                              app.t('Delete "${p.nameEn}"?',
                                  '"${p.nameMm}" ကို ဖျက်မလား?'))) {
                            if (!context.mounted) return;
                            adminRun(context, (a) => a.deleteProduct(p.id),
                                app.t('Product deleted', 'ဖျက်ပြီးပါပြီ'));
                          }
                        },
                      ),
                    ]),
                  ),
                )),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------- Categories
class _CategoriesTab extends StatefulWidget {
  const _CategoriesTab();
  @override
  State<_CategoriesTab> createState() => _CategoriesTabState();
}

class _CategoriesTabState extends State<_CategoriesTab> {
  final _label = TextEditingController();
  final _id = TextEditingController();

  @override
  void dispose() {
    _label.dispose();
    _id.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final app = appState;
    final cats = app.data?.categories ?? [];
    final products = app.data?.products ?? [];
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(children: [
              TextField(
                controller: _label,
                decoration: InputDecoration(
                    labelText: app.t('Category label (EN)', 'အမျိုးအစားအမည်')),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _id,
                decoration: InputDecoration(
                    labelText: app.t('ID (optional)', 'ID (ရွေးချယ်ရန်)'),
                    helperText: 'e.g. Wallet'),
              ),
              const SizedBox(height: 8),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  icon: const Icon(Icons.add),
                  label: Text(app.t('Add Category', 'အမျိုးအစား ထည့်မည်')),
                  onPressed: () async {
                    final label = _label.text.trim();
                    if (label.isEmpty) return;
                    final id = (_id.text.trim().isEmpty ? label : _id.text.trim())
                        .replaceAll(RegExp(r'\s+'), '-');
                    final ok = await adminRun(
                        context,
                        (a) => a.addCategory(
                            CategoryItem(id: id, labelEn: label)),
                        app.t('Category added', 'ထည့်ပြီးပါပြီ'));
                    if (ok) {
                      _label.clear();
                      _id.clear();
                    }
                  },
                ),
              ),
            ]),
          ),
        ),
        const SizedBox(height: 8),
        ...cats.map((c) {
          final count = c.id == 'All'
              ? products.length
              : products.where((p) => p.category == c.id).length;
          return Card(
            margin: const EdgeInsets.only(bottom: 8),
            child: ListTile(
              title: Text(c.labelEn),
              subtitle: Text('ID: ${c.id} • $count ${app.t('bags', 'လုံး')}'),
              trailing: c.id == 'All'
                  ? null
                  : IconButton(
                      icon: const Icon(Icons.delete_outline, color: Colors.red),
                      onPressed: () async {
                        if (await confirmDialog(context,
                            app.t('Delete "${c.labelEn}"?', '"${c.labelEn}" ဖျက်မလား?'))) {
                          if (!context.mounted) return;
                          adminRun(context, (a) => a.deleteCategory(c.id),
                              app.t('Category deleted', 'ဖျက်ပြီးပါပြီ'));
                        }
                      },
                    ),
            ),
          );
        }),
      ],
    );
  }
}

// ---------------------------------------------------------------- Users
class _UsersTab extends StatelessWidget {
  const _UsersTab();

  @override
  Widget build(BuildContext context) {
    final app = appState;
    final users = app.data?.users ?? [];
    final me = app.user;
    return RefreshIndicator(
      onRefresh: app.refresh,
      child: ListView(
        padding: const EdgeInsets.all(12),
        children: users.map((u) {
          final isMe = u.id == me?.id;
          return Card(
            margin: const EdgeInsets.only(bottom: 8),
            child: ListTile(
              leading: CircleAvatar(
                child: Text(u.name.isNotEmpty ? u.name[0].toUpperCase() : '?'),
              ),
              title: Text('${u.name}${isMe ? ' (${app.t('you', 'သင်')})' : ''}'),
              subtitle: Text('${u.email}\n${u.phone} • ${u.city}'),
              isThreeLine: true,
              trailing: isMe
                  ? const Chip(label: Text('admin'))
                  : PopupMenuButton<String>(
                      child: Chip(
                        label: Text(u.role),
                        backgroundColor: u.isAdmin ? Colors.amber.shade100 : null,
                      ),
                      onSelected: (v) async {
                        if (v == 'delete') {
                          if (await confirmDialog(context,
                              app.t('Delete user ${u.email}?', '${u.email} ကို ဖျက်မလား?'))) {
                            if (!context.mounted) return;
                            adminRun(context, (a) => a.deleteUser(u.id),
                                app.t('User deleted', 'ဖျက်ပြီးပါပြီ'));
                          }
                        } else {
                          adminRun(context, (a) => a.updateUserRole(u.id, v),
                              app.t('Role updated', 'Role ပြောင်းပြီးပါပြီ'));
                        }
                      },
                      itemBuilder: (_) => [
                        if (!u.isAdmin)
                          PopupMenuItem(
                              value: 'admin',
                              child: Text(app.t('Make Admin', 'Admin ပြုလုပ်မည်'))),
                        if (u.isAdmin)
                          PopupMenuItem(
                              value: 'customer',
                              child: Text(app.t('Make Customer', 'Customer ပြောင်းမည်'))),
                        PopupMenuItem(
                            value: 'delete',
                            child: Text(app.t('Delete', 'ဖျက်မည်'),
                                style: const TextStyle(color: Colors.red))),
                      ],
                    ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

// ---------------------------------------------------------------- Announcements
class _AnnouncementsTab extends StatefulWidget {
  const _AnnouncementsTab();
  @override
  State<_AnnouncementsTab> createState() => _AnnouncementsTabState();
}

class _AnnouncementsTabState extends State<_AnnouncementsTab> {
  final _title = TextEditingController();
  final _content = TextEditingController();
  final _image = TextEditingController();
  String _tag = kAnnouncementTags.first;

  @override
  void dispose() {
    _title.dispose();
    _content.dispose();
    _image.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final app = appState;
    final anns = app.data?.announcements ?? [];
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(children: [
              TextField(
                controller: _title,
                decoration: InputDecoration(labelText: app.t('Title', 'ခေါင်းစဉ်')),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _content,
                maxLines: 4,
                decoration: InputDecoration(labelText: app.t('Content', 'အကြောင်းအရာ')),
              ),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                value: _tag,
                decoration: const InputDecoration(labelText: 'Tag'),
                items: kAnnouncementTags
                    .map((t) => DropdownMenuItem(value: t, child: Text(t)))
                    .toList(),
                onChanged: (v) => setState(() => _tag = v ?? _tag),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _image,
                keyboardType: TextInputType.url,
                decoration: InputDecoration(
                    labelText: app.t('Image URL (optional)', 'ပုံ URL (ရွေးချယ်ရန်)')),
              ),
              const SizedBox(height: 8),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  icon: const Icon(Icons.campaign),
                  label: Text(app.t('Publish', 'တင်မည်')),
                  onPressed: () async {
                    if (_title.text.trim().isEmpty ||
                        _content.text.trim().isEmpty) {
                      toast(context, app.t('Title and content required',
                          'ခေါင်းစဉ်နှင့် အကြောင်းအရာ ဖြည့်ပါ'), error: true);
                      return;
                    }
                    final ann = Announcement(
                      id: 'ann-${DateTime.now().millisecondsSinceEpoch}',
                      title: _title.text.trim(),
                      content: _content.text.trim(),
                      tag: _tag,
                      image: _image.text.trim().isEmpty ? null : _image.text.trim(),
                      createdAt: DateTime.now().toUtc().toIso8601String(),
                      authorName: app.user?.name,
                    );
                    final ok = await adminRun(context, (a) => a.addAnnouncement(ann),
                        app.t('Announcement published', 'ကြေညာချက် တင်ပြီးပါပြီ'));
                    if (ok) {
                      _title.clear();
                      _content.clear();
                      _image.clear();
                    }
                  },
                ),
              ),
            ]),
          ),
        ),
        const SizedBox(height: 8),
        ...anns.map((a) => AnnouncementCard(
              ann: a,
              onDelete: () async {
                if (await confirmDialog(context,
                    app.t('Delete this announcement?', 'ဤကြေညာချက်ကို ဖျက်မလား?'))) {
                  if (!context.mounted) return;
                  adminRun(context, (api) => api.deleteAnnouncement(a.id),
                      app.t('Deleted', 'ဖျက်ပြီးပါပြီ'));
                }
              },
            )),
      ],
    );
  }
}

// ---------------------------------------------------------------- Themes
class _ThemesTab extends StatelessWidget {
  const _ThemesTab();

  @override
  Widget build(BuildContext context) {
    final app = appState;
    final current = app.data?.theme ?? 'luxury-gold';
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        Text(app.t(
            'The selected theme applies to both the website and the mobile app.',
            'ရွေးချယ်သော Theme သည် Website နှင့် Mobile App နှစ်ခုလုံးတွင် သက်ရောက်ပါမည်။')),
        const SizedBox(height: 12),
        ...kShopThemes.map((t) {
          final selected = t.id == current;
          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(t.radius),
              side: BorderSide(
                  color: selected ? t.accent : Colors.grey.shade300,
                  width: selected ? 3 : 1),
            ),
            clipBehavior: Clip.antiAlias,
            child: InkWell(
              onTap: selected
                  ? null
                  : () => adminRun(context, (a) => a.updateTheme(t.id),
                      app.t('Theme updated', 'Theme ပြောင်းပြီးပါပြီ')),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    height: 70,
                    decoration: BoxDecoration(gradient: t.heroGradient),
                    alignment: Alignment.center,
                    child: Text(t.nameEn,
                        style: TextStyle(
                            color: t.onHero, fontWeight: FontWeight.bold)),
                  ),
                  Container(
                    color: t.background,
                    padding: const EdgeInsets.all(12),
                    child: Row(children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(t.nameMm,
                                style: const TextStyle(
                                    fontWeight: FontWeight.bold)),
                            Text(app.isEn ? t.descriptionEn : t.descriptionMm,
                                style: const TextStyle(fontSize: 12)),
                          ],
                        ),
                      ),
                      if (selected)
                        Icon(Icons.check_circle, color: t.accent, size: 28),
                    ]),
                  ),
                ],
              ),
            ),
          );
        }),
      ],
    );
  }
}
