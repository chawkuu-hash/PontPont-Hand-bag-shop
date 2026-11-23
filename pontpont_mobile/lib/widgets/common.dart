import 'dart:convert';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../services/app_state.dart';

final _money = NumberFormat('#,###');
String mmk(num v) => '${_money.format(v)} Ks';

String fmtDate(String iso) {
  final d = DateTime.tryParse(iso);
  if (d == null) return iso;
  return DateFormat('dd MMM yyyy, hh:mm a').format(d.toLocal());
}

Color hexColor(String hex) {
  var h = hex.replaceAll('#', '');
  if (h.length == 3) h = h.split('').map((c) => '$c$c').join();
  if (h.length == 6) h = 'FF$h';
  return Color(int.tryParse(h, radix: 16) ?? 0xFF8B4513);
}

Color statusColor(String status) {
  switch (status) {
    case 'Confirmed':
      return Colors.blue;
    case 'Shipped':
      return Colors.indigo;
    case 'Delivered':
      return Colors.green;
    case 'Cancelled':
      return Colors.red;
    default:
      return Colors.orange;
  }
}

String statusLabel(String status) {
  final app = appState;
  switch (status) {
    case 'Pending':
      return app.t('Pending', 'စောင့်ဆိုင်းဆဲ');
    case 'Confirmed':
      return app.t('Confirmed', 'အတည်ပြုပြီး');
    case 'Shipped':
      return app.t('Shipped', 'ပို့ဆောင်နေဆဲ');
    case 'Delivered':
      return app.t('Delivered', 'ရောက်ရှိပြီး');
    case 'Cancelled':
      return app.t('Cancelled', 'ပယ်ဖျက်ပြီး');
  }
  return status;
}

void toast(BuildContext context, String msg, {bool error = false}) {
  ScaffoldMessenger.of(context)
    ..hideCurrentSnackBar()
    ..showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: error ? Colors.red.shade700 : null,
      behavior: SnackBarBehavior.floating,
    ));
}

Future<bool> confirmDialog(BuildContext context, String message) async {
  final app = appState;
  final ok = await showDialog<bool>(
    context: context,
    builder: (ctx) => AlertDialog(
      content: Text(message),
      actions: [
        TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text(app.t('Cancel', 'မလုပ်တော့ပါ'))),
        FilledButton(
            style: FilledButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () => Navigator.pop(ctx, true),
            child: Text(app.t('Confirm', 'အတည်ပြုမည်'))),
      ],
    ),
  );
  return ok ?? false;
}

/// Image that supports http(s) URLs and `data:image/...;base64,` URIs.
class AppImage extends StatelessWidget {
  final String? src;
  final BoxFit fit;
  final double? width;
  final double? height;
  const AppImage(this.src,
      {super.key, this.fit = BoxFit.cover, this.width, this.height});

  static final Map<String, Uint8List> _cache = {};

  @override
  Widget build(BuildContext context) {
    final placeholder = Container(
      width: width,
      height: height,
      color: Colors.grey.shade200,
      alignment: Alignment.center,
      child: const Icon(Icons.shopping_bag_outlined, color: Colors.grey),
    );
    final s = src ?? '';
    if (s.isEmpty) return placeholder;
    if (s.startsWith('data:image/')) {
      try {
        final bytes =
            _cache.putIfAbsent(s, () => base64Decode(s.split(',').last));
        return Image.memory(bytes,
            fit: fit,
            width: width,
            height: height,
            errorBuilder: (_, __, ___) => placeholder);
      } catch (_) {
        return placeholder;
      }
    }
    return Image.network(
      s,
      fit: fit,
      width: width,
      height: height,
      errorBuilder: (_, __, ___) => placeholder,
      loadingBuilder: (c, child, p) => p == null ? child : placeholder,
    );
  }
}

class StatusChip extends StatelessWidget {
  final String status;
  const StatusChip(this.status, {super.key});

  @override
  Widget build(BuildContext context) {
    final c = statusColor(status);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: c.withOpacity(0.12),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: c.withOpacity(0.4)),
      ),
      child: Text(statusLabel(status),
          style: TextStyle(
              color: c, fontSize: 11, fontWeight: FontWeight.bold)),
    );
  }
}

class SectionTitle extends StatelessWidget {
  final String text;
  const SectionTitle(this.text, {super.key});
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.fromLTRB(4, 16, 4, 8),
        child: Text(text,
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
      );
}

/// Simple language toggle (EN | MM) used in app bars.
class LangToggle extends StatelessWidget {
  const LangToggle({super.key});
  @override
  Widget build(BuildContext context) {
    final app = appState;
    return TextButton(
      onPressed: () => app.setLang(app.isEn ? 'mm' : 'en'),
      style: TextButton.styleFrom(
          foregroundColor: Theme.of(context).appBarTheme.foregroundColor),
      child: Text(app.isEn ? 'MM' : 'EN',
          style: const TextStyle(fontWeight: FontWeight.bold)),
    );
  }
}
