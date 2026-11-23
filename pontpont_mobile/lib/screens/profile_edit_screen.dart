import 'package:flutter/material.dart';

import '../config/constants.dart';
import '../services/app_state.dart';
import '../widgets/common.dart';

class ProfileEditScreen extends StatefulWidget {
  const ProfileEditScreen({super.key});
  @override
  State<ProfileEditScreen> createState() => _ProfileEditScreenState();
}

class _ProfileEditScreenState extends State<ProfileEditScreen> {
  final _form = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _phone = TextEditingController();
  final _address = TextEditingController();
  final _password = TextEditingController();
  String _city = kCities.first.name;
  bool _saving = false;

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
    for (final c in [_name, _phone, _address, _password]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _save() async {
    final app = appState;
    final user = app.user;
    if (user == null || !_form.currentState!.validate()) return;
    setState(() => _saving = true);
    try {
      await app.run((a) => a.updateProfile(
            userId: user.id,
            name: _name.text.trim(),
            phone: _phone.text.trim(),
            city: _city,
            address: _address.text.trim(),
            newPassword: _password.text,
          ));
      if (!mounted) return;
      toast(context, app.t('Profile saved', 'Profile သိမ်းဆည်းပြီးပါပြီ'));
      Navigator.pop(context);
    } catch (e) {
      if (mounted) toast(context, e.toString(), error: true);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final app = appState;
    String? req(String? v) => (v == null || v.trim().isEmpty)
        ? app.t('Required', 'ဖြည့်ရန်လိုအပ်ပါသည်')
        : null;
    return Scaffold(
      appBar: AppBar(title: Text(app.t('Edit Profile', 'Profile ပြင်ရန်'))),
      body: Form(
        key: _form,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Text(app.user?.email ?? '',
                style: const TextStyle(color: Colors.grey)),
            const SizedBox(height: 12),
            TextFormField(
              controller: _name,
              decoration: InputDecoration(labelText: app.t('Name', 'အမည်')),
              validator: req,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _phone,
              keyboardType: TextInputType.phone,
              decoration:
                  InputDecoration(labelText: app.t('Phone', 'ဖုန်းနံပါတ်')),
              validator: req,
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              value: _city,
              isExpanded: true,
              decoration: InputDecoration(labelText: app.t('City', 'မြို့')),
              items: kCities
                  .map((c) => DropdownMenuItem(
                      value: c.name,
                      child: Text(c.name, overflow: TextOverflow.ellipsis)))
                  .toList(),
              onChanged: (v) => setState(() => _city = v ?? _city),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _address,
              maxLines: 2,
              decoration: InputDecoration(labelText: app.t('Address', 'လိပ်စာ')),
            ),
            SectionTitle(app.t('Change Password', 'စကားဝှက် ပြောင်းရန်')),
            TextFormField(
              controller: _password,
              obscureText: true,
              decoration: InputDecoration(
                labelText: app.t('New password (leave blank to keep)',
                    'စကားဝှက်အသစ် (မပြောင်းလိုပါက ကွက်လပ်ထားပါ)'),
              ),
              validator: (v) => v != null && v.isNotEmpty && v.length < 6
                  ? app.t('At least 6 characters', 'အနည်းဆုံး (၆) လုံး')
                  : null,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _saving ? null : _save,
              child: _saving
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2))
                  : Text(app.t('Save', 'သိမ်းဆည်းမည်')),
            ),
          ],
        ),
      ),
    );
  }
}
