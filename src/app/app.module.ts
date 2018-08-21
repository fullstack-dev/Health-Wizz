import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { IonicStorageModule } from '@ionic/storage';
import { Camera } from '@ionic-native/camera';
import { NativeStorage } from '@ionic-native/native-storage';
import { ImagePicker } from '@ionic-native/image-picker';
import { Contacts } from '@ionic-native/contacts';
import { Network } from '@ionic-native/network';
import { Crop } from '@ionic-native/crop';
import { FileTransfer } from '@ionic-native/file-transfer';
import { Keyboard } from '@ionic-native/keyboard';
import { HttpService } from '../providers/http-service';
import { SwiperModule } from 'angular2-useful-swiper';
import { EmailComposer } from '@ionic-native/email-composer';
import { Calendar } from '@ionic-native/calendar';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { ThemeableBrowser } from '@ionic-native/themeable-browser';
import { File } from '@ionic-native/file';
import { FilePath } from '@ionic-native/file-path';
import { SocialSharing } from '@ionic-native/social-sharing';
import { SQLite } from '@ionic-native/sqlite';
import { Toast } from '@ionic-native/toast';
import { SMS } from '@ionic-native/sms';
import { WebIntent } from '@ionic-native/web-intent';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { Zip } from '@ionic-native/zip';
import { FileOpener } from '@ionic-native/file-opener';
import { DocumentViewer } from '@ionic-native/document-viewer';
import { Clipboard } from '@ionic-native/clipboard';
import { MyApp } from './app.component';
import { LoginPage } from '../pages/UserAccount/login/login';
import { Rest } from '../providers/rest';
import { Helper } from '../providers/helper-service';
import { FCM } from '@ionic-native/fcm';
// FIREBASE
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule, AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { LoginService } from '../providers/login-service';

// producation firebase
export const firebaseConfig = {
  apiKey: "AIzaSyCPsgFOjXRoh7r-3vtWwFndz2xVuEkq5c8",
  authDomain: "hwapp-4f923.firebaseapp.com",
  databaseURL: "https://hwapp-4f923.firebaseio.com",
  projectId: "hwapp-4f923",
  storageBucket: "hwapp-4f923.appspot.com",
  messagingSenderId: '932726768359'
};

// test firebase
// export const firebaseConfig = {
//   apiKey: "AIzaSyCiLqScVhdAdfMH9DBoBIbslMnvf5e_xCw",
//   authDomain: "hwapptest-3d51c.firebaseapp.com",
//   databaseURL: "https://hwapptest-3d51c.firebaseio.com",
//   projectId: "hwapptest-3d51c",
//   storageBucket: "hwapptest-3d51c.appspot.com",
//   messagingSenderId: "417589897797"
// };

import { HomePageModule } from '../pages/home/home.module';
import { UserService } from '../providers/user-service';
import { TokenService } from '../providers/token-service';
import { RestDataProvider } from '../providers/rest-data-service/rest-data-service';
import { LocalDataProvider } from '../providers/local-data/local-data';
import { HistoryProvider } from '../providers/history/history';
import { LanguageProvider } from '../providers/language/language';
import { ValidatorProvider } from '../providers/validator/validator';
import { NotificationProvider } from '../providers/notification/notification';
import { WalletProvider } from '../providers/wallet/wallet';
import { ConstProvider } from '../providers/const/const';
import { MyWalletProvider } from '../providers/wallet/my-wallet-provider';
@NgModule({
  declarations: [
    MyApp,
    LoginPage
  ],
  imports: [
    BrowserModule,
    SwiperModule,
    IonicStorageModule.forRoot({
      name: 'healthwizz',
      driverOrder: ['sqlite', 'websql', 'indexdb']
    }),
    ReactiveFormsModule,
    HttpClientModule,
    HttpModule,
    PdfViewerModule,
    IonicModule.forRoot(MyApp, {
      backButtonIcon: 'ios-arrow-back',
      tabsPlacement: 'top',
      backButtonText: '',
      scrollAssist: false,
      autoFocusAssist: false
    }),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    HomePageModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    HttpService,
    Camera,
    NativeStorage,
    ImagePicker,
    Rest,
    LoginService,
    UserService,
    TokenService,
    AngularFireDatabase,
    Helper,
    FCM,
    Contacts,
    Clipboard,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    EmailComposer,
    Calendar,
    RestDataProvider,
    LocalDataProvider,
    HistoryProvider,
    LanguageProvider,
    InAppBrowser,
    ThemeableBrowser,
    File,
    FilePath,
    Camera,
    Crop,
    FileTransfer,
    Network,
    ValidatorProvider,
    SocialSharing,
    SQLite,
    Toast,
    SMS,
    NotificationProvider,
    WebIntent,
    Zip,
    Keyboard,
    FileOpener,
    DocumentViewer,
    WalletProvider,
    ConstProvider,
    MyWalletProvider
  ]
})
export class AppModule { }
