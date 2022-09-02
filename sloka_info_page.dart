import 'dart:io' show File, Platform;

import 'package:connectivity/connectivity.dart';
import 'package:ext_storage/ext_storage.dart';
import 'package:flutter/material.dart';
import 'package:flutter_downloader/flutter_downloader.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:provider/provider.dart';
import 'package:share/share.dart';
import 'package:sloka_stotra/core/constants/app_constants.dart';
import 'package:sloka_stotra/core/di/locator.dart';
import 'package:sloka_stotra/core/models/sloka_language.dart';
import 'package:sloka_stotra/core/models/sloka_list_item_model.dart';
import 'package:sloka_stotra/core/service/audio_service.dart';
import 'package:sloka_stotra/core/providers/sloka_provider.dart';
import 'package:sloka_stotra/core/widgets/circular_icon_button.dart';
import 'package:sloka_stotra/core/widgets/circular_svg_button.dart';
import 'package:sloka_stotra/core/widgets/search_appbar.dart';
import 'package:sloka_stotra/features/sloka_info/widgets/language_buttons_bar.dart';
import 'package:sloka_stotra/features/sloka_info/widgets/sloka_info_content.dart';
import 'package:sloka_stotra/features/sloka_info/widgets/sloka_info_title_description.dart';
import 'package:sloka_stotra/features/sloka_list/widgets/play_pause_icon_button.dart';
import 'package:sloka_stotra/features/sloka_list/widgets/sloka_or_seekbar_controls.dart';

class SlokaInfoPage extends StatelessWidget {
  const SlokaInfoPage();

  @override
  Widget build(BuildContext context) {
    final slokaListItem = context.select<SlokaProvider, SlokaListItemModel>(
      (provider) => provider.currentSlokaListItemModel,
    );

    return Scaffold(
      backgroundColor: AppConstants.COLOR_PAGE_BACKGROUND,
      body: SafeArea(
        child: _SlokaInfoPage(
          slokaListItem: slokaListItem,
        ),
      ),
    );
  }
}

class _SlokaInfoPage extends StatefulWidget {
  final SlokaListItemModel slokaListItem;

  const _SlokaInfoPage({
    Key key,
    @required this.slokaListItem,
  }) : super(key: key);

  @override
  __SlokaInfoPageState createState() => __SlokaInfoPageState();
}

class __SlokaInfoPageState extends State<_SlokaInfoPage>
    with TickerProviderStateMixin {
  static const _DEFAULT_SELECTED_LANGUAGE = SlokaLanguage.ENGLISH;
  final _fullScreenContentDuration = const Duration(milliseconds: 300);
  final _fullScreenContentCurve = Curves.easeInOutCubic;
  final horizontalPadding = 12.0;
  AudioService _audioService;
  SlokaLanguageData _selectedLanguage;
  bool _isFullScreen = false;

  @override
  void initState() {
    super.initState();
    _audioService = getIt<AudioService>();
    _selectedLanguage = _DEFAULT_SELECTED_LANGUAGE;
    FlutterDownloader.registerCallback(_downloadCallback);
  }

  @override
  void didUpdateWidget(covariant _SlokaInfoPage oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.slokaListItem.id != widget.slokaListItem.id) {
      setState(() {
        _selectedLanguage = _DEFAULT_SELECTED_LANGUAGE;
      });
    }
  }

  @override
  void dispose() {
    _audioService.reset();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final listItemModel = context.select<SlokaProvider, SlokaListItemModel>(
      (provider) => provider.currentSlokaListItemModel,
    );

    if (listItemModel == null) {
      return Center(
        child: CircularProgressIndicator(
          valueColor: const AlwaysStoppedAnimation<Color>(
            AppConstants.COLOR_ORANGE,
          ),
        ),
      );
    }

    final _languageData = _getLanguageData(listItemModel);

    return WillPopScope(
      onWillPop: _onWillPop,
      child: Column(
        children: [
          AnimatedSize(
            vsync: this,
            duration: _fullScreenContentDuration,
            curve: _fullScreenContentCurve,
            alignment: Alignment.topCenter,
            child: SizedBox(
              height: _isFullScreen ? 0 : null,
              child: Column(
                children: [
                  const SearchAppBar(
                    showBackIcon: true,
                    showSearchIcon: false,
                  ),
                  _slokaTitleAndDescription(),
                  LanguageButtonBar(
                    selectedLanguage: _selectedLanguage,
                    onLanguageSelected: _onLanguageSelected,
                  )
                ],
              ),
            ),
          ),
          Expanded(
            child: _languageData == null || _languageData.isEmpty
                ? Center(
                    child: Text('No data'),
                  )
                : SlokaInfoContent(
                    slokaText: _languageData,
                    videoLink: listItemModel.videoLink,
                    isFullScreen: _isFullScreen,
                    margin: EdgeInsets.symmetric(
                      horizontal: _isFullScreen ? 0 : horizontalPadding,
                      vertical: _isFullScreen ? 0 : horizontalPadding,
                    ),
                    duration: _fullScreenContentDuration,
                    curve: _fullScreenContentCurve,
                    onFullScreenPressed: _onFullScreenPressed,
                  ),
          ),
          AnimatedSize(
            vsync: this,
            duration: _fullScreenContentDuration,
            curve: _fullScreenContentCurve,
            alignment: Alignment.bottomCenter,
            child: SizedBox(
              height: _isFullScreen ? 0 : kToolbarHeight * 0.8,
              child: _controlButtons(listItemModel),
            ),
          ),
        ],
      ),
    );
  }

  Widget _slokaTitleAndDescription() {
    return Padding(
      padding: EdgeInsets.only(
        left: horizontalPadding,
        right: horizontalPadding,
        top: horizontalPadding * 2,
        bottom: horizontalPadding,
      ),
      child: SlokaInfoTitleDescription(
        title: widget.slokaListItem.title,
        description: widget.slokaListItem.synopsis,
      ),
    );
  }

  Widget _controlButtons(SlokaListItemModel listItemModel) {
    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: 4.0,
      ),
      child: Row(
        children: [
          Expanded(
            child: SlokaOrSeekbarControls(
              audioService: _audioService,
            ),
          ),
          PlayPauseIconButton(
            audioService: _audioService,
            slokaId: listItemModel.id,
            audioLink: listItemModel.audioLink ?? "",
          ),
          CircularSvgButton(
            svgAsset: AppConstants.ICON_DOWNLOAD,
            iconColor: AppConstants.COLOR_ORANGE,
            size: 22.0,
            onPressed: () => _download(listItemModel.pdfLink),
            disabled: listItemModel.pdfLink?.isEmpty ?? true,
          ),
          CircularIconButton(
            icon: Icons.share,
            iconColor: AppConstants.COLOR_ORANGE,
            iconSize: 24.0,
            onPressed: () => _shareSloka(listItemModel),
          ),
          const SizedBox(width: 12.0),
        ],
      ),
    );
  }

  void _onFullScreenPressed() {
    setState(() {
      _isFullScreen = !_isFullScreen;
    });
  }

  String _getLanguageData(SlokaListItemModel listItemModel) {
    switch (_selectedLanguage) {
      case SlokaLanguage.ENGLISH:
        return listItemModel.englishData;
      case SlokaLanguage.SANSKRIT:
        return listItemModel.sanskritData;
      default:
        return listItemModel.bothData;
    }
  }

  void _onLanguageSelected(SlokaLanguageData language) {
    setState(() {
      _selectedLanguage = language;
    });
  }

  Future<void> _download(String pdfLink) async {
    // pdfLink = 'http://www.africau.edu/images/default/sample.pdf';
    final isOnline =
        (await Connectivity().checkConnectivity()) != ConnectivityResult.none;
    if (!isOnline) {
      showToast('No internet connection');
      return;
    }

    final hasStoragePermission = await Permission.storage.isGranted;
    if (!hasStoragePermission) {
      final isStoragePermissionGranted =
          await Permission.storage.request().isGranted;
      if (!isStoragePermissionGranted) {
        showToast('Storage permission needed to download file');
        return;
      }
    }

    final fileName = pdfLink.split('/').last;
    final allTasks = await FlutterDownloader.loadTasks();
    final taskInDB = allTasks.firstWhere(
      (t) => t.filename == fileName,
      orElse: () => null,
    );

    if (taskInDB != null) {
      final file = _fileFromDownloadTask(taskInDB);
      bool hasFile = false;
      try {
        hasFile = file.existsSync();
      } catch (e) {
        hasFile = false;
      }
      if (hasFile) {
        showToast('File already downloaded');
        return;
      }

      if (taskInDB.status == DownloadTaskStatus.running) {
        showToast('Downloading file...');
        return;
      }
    }

    final savedDir = Platform.isAndroid
        ? (await ExtStorage.getExternalStoragePublicDirectory(
            ExtStorage.DIRECTORY_DOWNLOADS,
          ))
        : (await getApplicationDocumentsDirectory()).path;

    FlutterDownloader.enqueue(
      url: pdfLink,
      savedDir: savedDir,
      fileName: fileName,
    );
    showToast('Starting download...');
  }

  File _fileFromDownloadTask(DownloadTask downloadTask) {
    return File(
      '${downloadTask.savedDir}${Platform.pathSeparator}${downloadTask.filename}',
    );
  }

  Future<void> _shareSloka(SlokaListItemModel listItemModel) async {
    // TODO: change sloka shareable text
    final _shareText =
        "Check this sloka\n${listItemModel.title}, Download from Play Store for Android: https://play.google.com/store/apps/details?id=com.sloka_stotra and App Store for iOS: https://apps.apple.com/us/app/stotrasagar/id1581327019#?platform=iphone";
    await Share.share(_shareText);
  }

  Future<bool> _onWillPop() {
    if (_isFullScreen) {
      _onFullScreenPressed();
      return Future<bool>.value(false);
    }
    return Future<bool>.value(true);
  }

  void showToast(String message) {
    Fluttertoast.showToast(
      msg: message,
      toastLength: Toast.LENGTH_LONG,
      backgroundColor: Colors.black54,
    );
  }
}

void _downloadCallback(
  String id,
  DownloadTaskStatus status,
  int progress,
) {
  print('ID: $id == $status == $progress');
}
