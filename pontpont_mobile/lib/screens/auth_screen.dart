import 'package:flutter/material.dart';

import '../config/constants.dart';
import '../services/app_state.dart';
import '../widgets/common.dart';

/// Login / Register screen. Pops with `true` on success.
class AuthScreen extends StatefulWidget {
  final bool startWithRegister;
  const AuthScreen({super.key, this.startWithRegister = false});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  final _form = GlobalKey<FormState>();
  late bool _register = widget.startWithRegister;
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _name = TextEditingController();
  final _phone = TextEditingController();
  final _address = TextEditingController();
  String _city = kCities.first.name;
  bool _loading = false;
  bool _obscure = true;
  String? _error;

  @override
  void dispose() {
    for (final c in [_email, _password, _name, _phone, _address]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _submit() async {
    final app = appState;
    if (!_form.currentState!.validate()) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      if (_register) {
        await app.run((a) => a.register(
              name: _name.text.trim(),
              email: _email.text.trim(),
              password: _password.text,
              phone: _phone.text.trim(),
              city: _city,
              address: _address.text.trim(),
            ));
      } else {
        await app.run((a) => a.login(_email.text.trim(), _password.text));
      }
      if (!mounted) return;
      toast(
          context,
          app.t('Welcome, ${app.user?.name ?? ''}!',
              'ကြိုဆိုပါတယ် ${app.user?.name ?? ''}!'));
      Navigator.pop(context, true);
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final app = appState;
    String? req(String? v) => (v == null || v.trim().isEmpty)
        ? app.t('Required', 'ဖြည့်ရန်လိုအပ်ပါသည်')
        : null;

    return Scaffold(
      appBar: AppBar(
        title: Text(_register
            ? app.t('Create Account', 'အကောင့်သစ်ဖွင့်ရန်')
            : app.t('Login', 'အကောင့်ဝင်ရန်')),
      ),
      body: Form(
        key: _form,
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            const Icon(Icons.shopping_bag, size: 64),
            const SizedBox(height: 8),
            Text(ShopInfo.nameEn,
                textAlign: TextAlign.center,
                style:
                    const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 20),
            if (_error != null)
              Container(
                padding: const EdgeInsets.all(10),
                margin: const EdgeInsets.only(bottom: 12),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(_error!, style: const TextStyle(color: Colors.red)),
              ),
            if (_register) ...[
              TextFormField(
                controller: _name,
                decoration: InputDecoration(
                    labelText: app.t('Full Name', 'အမည်'),
                    prefixIcon: const Icon(Icons.person_outline)),
                validator: req,
              ),
              const SizedBox(height: 12),
            ],
            TextFormField(
              controller: _email,
              keyboardType: TextInputType.emailAddress,
              autofillHints: const [AutofillHints.email],
              decoration: InputDecoration(
                  labelText: app.t('Email', 'အီးမေးလ်'),
                  prefixIcon: const Icon(Icons.email_outlined)),
              validator: (v) {
                if (req(v) != null) return req(v);
                if (!v!.contains('@')) {
                  return app.t('Invalid email', 'အီးမေးလ် မှားနေပါသည်');
                }
                return null;
              },
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _password,
              obscureText: _obscure,
              decoration: InputDecoration(
                labelText: app.t('Password', 'စကားဝှက်'),
                prefixIcon: const Icon(Icons.lock_outline),
                suffixIcon: IconButton(
                  icon: Icon(_obscure ? Icons.visibility : Icons.visibility_off),
                  onPressed: () => setState(() => _obscure = !_obscure),
                ),
              ),
              validator: (v) {
                if (req(v) != null) return req(v);
                if (_register && v!.length < 6) {
                  return app.t('At least 6 characters',
                      'အနည်းဆုံး (၆) လုံး ရှိရပါမည်');
                }
                return null;
              },
            ),
            if (_register) ...[
              const SizedBox(height: 12),
              TextFormField(
                controller: _phone,
                keyboardType: TextInputType.phone,
                decoration: InputDecoration(
                    labelText: app.t('Phone', 'ဖုန်းနံပါတ်'),
                    prefixIcon: const Icon(Icons.phone_outlined)),
                validator: req,
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: _city,
                isExpanded: true,
                decoration: InputDecoration(
                    labelText: app.t('City', 'မြို့'),
                    prefixIcon: const Icon(Icons.location_city)),
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
                decoration: InputDecoration(
                    labelText: app.t('Address', 'လိပ်စာ'),
                    prefixIcon: const Icon(Icons.home_outlined)),
              ),
            ],
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _loading ? null : _submit,
              child: _loading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2))
                  : Text(_register
                      ? app.t('Sign Up', 'အကောင့်ဖွင့်မည်')
                      : app.t('Login', 'အကောင့်ဝင်မည်')),
            ),
            const SizedBox(height: 8),
            TextButton(
              onPressed: () => setState(() {
                _register = !_register;
                _error = null;
              }),
              child: Text(_register
                  ? app.t('Already have an account? Login',
                      'အကောင့်ရှိပြီးသားလား? အကောင့်ဝင်ရန်')
                  : app.t("Don't have an account? Sign Up",
                      'အကောင့်မရှိသေးဘူးလား? အကောင့်ဖွင့်ရန်')),
            ),
            if (_register && (app.data?.usersCount ?? 1) == 0)
              Text(
                app.t('Note: the first registered account becomes Admin.',
                    'မှတ်ချက်: ပထမဆုံး ဖွင့်သော အကောင့်သည် Admin ဖြစ်ပါမည်။'),
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 12, color: Colors.grey),
              ),
          ],
        ),
      ),
    );
  }
}
