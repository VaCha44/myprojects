import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:sloka_stotra/core/constants/app_constants.dart';
import 'package:sloka_stotra/core/di/locator.dart';
import 'package:sloka_stotra/core/models/screen_type.dart';
import 'package:sloka_stotra/core/models/sloka_category_model.dart';
import 'package:sloka_stotra/core/providers/sloka_provider.dart';
import 'package:sloka_stotra/core/service/audio_service.dart';
import 'package:sloka_stotra/core/widgets/next_button.dart';
import 'package:sloka_stotra/core/widgets/previous_button.dart';
import 'package:sloka_stotra/core/widgets/search_appbar.dart';
import 'package:sloka_stotra/features/sloka_list/widgets/sloka_list_view.dart';

class SlokaListPage extends StatelessWidget {
  const SlokaListPage();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppConstants.COLOR_PAGE_BACKGROUND,
      body: SafeArea(
        child: Column(
          children: [
            const SearchAppBar(
              screenType: ScreenType.SLOKA_LIST,
              showBackIcon: true,
            ),
            Expanded(child: const _SlokaListContent()),
            const _PaginationButtons(),
          ],
        ),
      ),
    );
  }
}

class _SlokaListContent extends StatefulWidget {
  const _SlokaListContent();

  @override
  State<_SlokaListContent> createState() => _SlokaListContentState();
}

class _SlokaListContentState extends State<_SlokaListContent> {
  final imageSize = kToolbarHeight * 0.8;
  AudioService _audioService;

  @override
  void initState() {
    super.initState();
    _audioService = getIt<AudioService>();
  }

  @override
  void dispose() {
    _audioService.reset();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final slokaCategory = context.select<SlokaProvider, SlokaCategoryModel>(
      (provider) => provider.currentSlokaCategoryModel,
    );

    if (slokaCategory == null) {
      return Center(
        child: CircularProgressIndicator(
          valueColor: const AlwaysStoppedAnimation<Color>(
            AppConstants.COLOR_ORANGE,
          ),
        ),
      );
    }

    return Container(
      margin: const EdgeInsets.symmetric(
        horizontal: 4.0,
        vertical: 8.0,
      ),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(4.0),
        border: Border.all(color: AppConstants.COLOR_ORANGE),
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: 12.0,
              vertical: 12.0,
            ),
            child: Row(
              children: [
                if (slokaCategory.imageUrl != null)
                  ClipOval(
                    child: CachedNetworkImage(
                      imageUrl: slokaCategory.imageUrl,
                      width: imageSize,
                      height: imageSize,
                      fit: BoxFit.fill,
                    ),
                  ),
                const SizedBox(width: 18.0),
                Expanded(
                  child: Text(
                    slokaCategory.title,
                    style: TextStyle(
                      fontSize: 18.0,
                    ),
                  ),
                ),
              ],
            ),
          ),
          Expanded(child: const SlokaListView()),
        ],
      ),
    );
  }
}

class _PaginationButtons extends StatelessWidget {
  const _PaginationButtons();

  @override
  Widget build(BuildContext context) {
    final slokaProvider = context.watch<SlokaProvider>();
    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: 4.0,
      ),
      child: Row(
        children: [
          PreviousButton(
            text: "Back",
            onPressed: slokaProvider.gotoPreviousSlokaCategory,
            disable: slokaProvider.isCurrentSlokaCategoryFirst(),
          ),
          Spacer(),
          NextButton(
            text: "Next Sloka",
            onPressed: slokaProvider.gotoNextSlokaCategory,
            disable: slokaProvider.isCurrentSlokaCategoryLast(),
          ),
        ],
      ),
    );
  }
}
