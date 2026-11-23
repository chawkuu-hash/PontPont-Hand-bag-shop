import 'package:flutter/material.dart';

import '../config/constants.dart';
import '../services/app_state.dart';
import '../widgets/common.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});
  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  late final _url = TextEditingController(text: appState.api.baseUrl);
  bool _saving = false;

  @override
  void dispose() {
    _url.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: appState,
      builder: (context, _) {
        final app = appState;
        return Scaffold(
          appBar: AppBar(title: Text(app.t('Settings', 'ဆက်တင်များ'))),
          body: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              SectionTitle(app.t('Language', 'ဘာသာစကား')),
              SegmentedButton<String>(
                segments: const [
                  ButtonSegment(value: 'mm', label: Text('မြန်မာ')),
                  ButtonSegment(value: 'en', label: Text('English')),
                ],
                selected: {app.lang},
                onSelectionChanged: (s) => app.setLang(s.first),
              ),
              SectionTitle(app.t('Backend Server', 'Backend Server')),
              TextField(
                controller: _url,
                keyboardType: TextInputType.url,
                decoration: const InputDecoration(
                  labelText: 'Base URL',
                  helperText:
                      'e.g. https://your-domain.com • Emulator: http://10.0.2.2:3000',
                ),
              ),
              const SizedBox(height: 12),
              Row(children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: _saving
                        ? null
                        : () async {
                            setState(() => _saving = true);
                            await app.setBaseUrl(_url.text);
                            if (!context.mounted) return;
                            setState(() => _saving = false);
                            toast(
                              context,
                              app.error == null
                                  ? app.t('Connected ✓', 'ချိတ်ဆက်ပြီးပါပြီ ✓')
                                  : app.error!,
                              error: app.error != null,
                            );
                          },
                    child: Text(app.t('Save & Reconnect', 'သိမ်းပြီး ပြန်ချိတ်မည်')),
                  ),
                ),
                const SizedBox(width: 8),
                OutlinedButton(
                  onPressed: () => _url.text = AppConfig.publicBaseUrl,
                  child: const Text('Default'),
                ),
              ]),
              const SizedBox(height: 16),
              ListTile(
                leading: Icon(
                  app.error == null ? Icons.cloud_done : Icons.cloud_off,
                  color: app.error == null ? Colors.green : Colors.red,
                ),
                title: Text(app.error == null
                    ? app.t('Connected', 'ချိတ်ဆက်ထားသည်')
                    : app.t('Not connected', 'မချိတ်ဆက်ရသေးပါ')),
                subtitle: Text(app.api.baseUrl),
              ),
            ],
          ),
        );
      },
    );
  }
}
