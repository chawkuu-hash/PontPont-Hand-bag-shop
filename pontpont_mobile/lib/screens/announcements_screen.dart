import 'package:flutter/material.dart';

import '../models/shop_data.dart';
import '../services/app_state.dart';
import '../widgets/common.dart';

class AnnouncementsScreen extends StatelessWidget {
  const AnnouncementsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: appState,
      builder: (context, _) {
        final app = appState;
        final anns = app.data?.announcements ?? [];
        return Scaffold(
          appBar: AppBar(
            title: Text(app.t('Announcements', 'ကြေညာချက်များ')),
            actions: const [LangToggle()],
          ),
          body: RefreshIndicator(
            onRefresh: app.refresh,
            child: anns.isEmpty
                ? ListView(children: [
                    Padding(
                      padding: const EdgeInsets.all(48),
                      child: Center(
                          child: Text(app.t(
                              'No announcements', 'ကြေညာချက် မရှိသေးပါ'))),
                    ),
                  ])
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: anns.length,
                    itemBuilder: (c, i) => AnnouncementCard(ann: anns[i]),
                  ),
          ),
        );
      },
    );
  }
}

class AnnouncementCard extends StatelessWidget {
  final Announcement ann;
  final VoidCallback? onDelete;
  const AnnouncementCard({super.key, required this.ann, this.onDelete});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (ann.image != null && ann.image!.isNotEmpty)
            AspectRatio(aspectRatio: 16 / 9, child: AppImage(ann.image)),
          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(children: [
                  Chip(
                    label: Text(ann.tag, style: const TextStyle(fontSize: 11)),
                    visualDensity: VisualDensity.compact,
                  ),
                  const Spacer(),
                  if (onDelete != null)
                    IconButton(
                      icon: const Icon(Icons.delete_outline, color: Colors.red),
                      onPressed: onDelete,
                    ),
                ]),
                Text(ann.title,
                    style: const TextStyle(
                        fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 6),
                Text(ann.content, style: const TextStyle(height: 1.5)),
                const SizedBox(height: 8),
                Text(
                  [
                    if (ann.authorName != null) ann.authorName!,
                    fmtDate(ann.createdAt),
                  ].join(' • '),
                  style: const TextStyle(fontSize: 11, color: Colors.grey),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
