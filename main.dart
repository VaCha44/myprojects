import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_downloader/flutter_downloader.dart';
import 'package:provider/provider.dart';
import 'package:sloka_stotra/core/constants/app_constants.dart';
import 'package:sloka_stotra/core/di/locator.dart';
import 'package:sloka_stotra/core/providers/sloka_provider.dart';
import 'package:sloka_stotra/core/service/authentication_service.dart';
import 'package:sloka_stotra/features/home/pages/home_page.dart';
import 'package:sloka_stotra/features/login/pages/login_page.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:sloka_stotra/core/models/login_user.dart';
import 'package:firebase_auth/firebase_auth.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await FlutterDownloader.initialize();
  await Firebase.initializeApp();
  setupLocator();
  runApp(MyApp());
}

class MyApp extends StatefulWidget {

  @override
  _MyAppState createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {

  @override
  Widget build(BuildContext context) {

    var currentUser = getIt<AuthenticationService>().currentUser;
    Future<void> checkStorage() async {
      final prefs = await SharedPreferences.getInstance();

      final run = await prefs.getBool('is_first');
      if(run == null){
        final FirebaseAuth _auth = FirebaseAuth.instance;
        prefs.setBool('is_first', false);
        if(_auth.currentUser != null) {
          await _auth.signOut();
          setState(() { currentUser = null; });
        }
      }
    }

    checkStorage();

    return MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => SlokaProvider()),
        ],
        child: MaterialApp(
            title: AppConstants.APP_NAME,
            debugShowCheckedModeBanner: false,
            theme: ThemeData(
                primaryColor: Colors.blue,
            ),
            home: currentUser == null ? LoginPage() : HomePage(),
        ),
    );
  }
}
