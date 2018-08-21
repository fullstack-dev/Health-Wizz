import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, ModalController, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { File } from '@ionic-native/file';
import { LoginPage } from '../pages/UserAccount/login/login';
import { HomePage } from '../pages/home/home';
import { AngularFireAuth } from 'angularfire2/auth';
import { HttpService } from '../providers/http-service';
import { Subscription } from 'rxjs';
import { LocalDataProvider } from '../providers/local-data/local-data';
import { ChronicDisease } from '../models/classes';
import { UpdateMenuData } from '../models/interfaces';
import { UserService } from '../providers/user-service';
import { LanguageProvider } from '../providers/language/language';
import { RestDataProvider } from '../providers/rest-data-service/rest-data-service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Network } from '@ionic-native/network';
import { Keyboard } from '@ionic-native/keyboard';
import { Toast } from '@ionic-native/toast';
import { MyWalletProvider } from '../providers/wallet/my-wallet-provider';
import { WalletProvider } from '../providers/wallet/wallet';
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any;
  page_login: any;

  pages_up: Array<{ title: string, item_src: string, item_number: string, component: any }>;
  pages_down: Array<{ title: string, item_src: string, component: any }>;
  pages_middle: Array<{ title: string, item_src: string, component: any }>;
  updateMenuData: Subscription;
  chronicDiseases: Array<ChronicDisease>;
  circles: Array<any>;
  campaigns: Array<any>;
  composite_score: any;
  profilePic: any;
  userName: string;
  lang_resource: any;
  showSplash: boolean;
  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private file: File,
    public events: Events,
    private afAuth: AngularFireAuth,
    private keyboard: Keyboard,
    private userService: UserService,
    public local: LocalDataProvider,
    public modalCtrl: ModalController,
    private language_provider: LanguageProvider,
    private httpService: HttpService,
    private restService: RestDataProvider,
    public domSanitizer: DomSanitizer,
    private network: Network,
    private toast: Toast,
    private wallet: WalletProvider, //do not remove this entry
    private myWallet: MyWalletProvider  //do not remove this entry
  ) {
    this.platform.ready().then(() => {
      splashScreen.hide();
      this.showSplash = true;
      statusBar.styleDefault();
      if (platform.is('android')) {
        // keyboard.disableScroll(true);
        statusBar.overlaysWebView(false);
        statusBar.backgroundColorByHexString('#000000');
      }
      language_provider.parseLanguages();
      afAuth.authState.subscribe(user => {
        if (user == null) {
          this.showSplash = false;
          this.nav.setRoot(LoginPage);
        } else if (localStorage.getItem('authToken') && localStorage.getItem('userId')) {
          this.userService.setUserId(localStorage.getItem('userId'));
          // this.userService.resolveUserId(localStorage.getItem('userId'));
          this.httpService
            .getProfile()
            .subscribe(profile => {
              this.getUserInfo(profile.data.gender)
                .then(picUrl => {
                  this.userService.setProfilePic(picUrl);
                  this.userService.setProfile(profile.data);
                  this.showSplash = false;
                  // this.notification.registerToken();
                  // this.myWallet.updateWalletStatus();
                  this.nav.setRoot(HomePage, { from: 'login' });
                }, error => {
                  this.foundError(error, 'autologin');
                });
            }, error => {
              this.foundError(error, 'autologin');
            });
        } else {
          this.showSplash = false;
          this.nav.setRoot(LoginPage);
        }
      }, err => {
        this.foundError(err, 'autologin');
      });

      this.updateMenuData = this.local.$menuDataObserver
        .subscribe((data: UpdateMenuData) => {
          let cd = [];
          data.chronicDiseases.forEach((disease: ChronicDisease) => {
            let allinvite = true;
            disease.campaigns.forEach(campaign => {
              if (campaign.campaignInfo.circleInfo.invitationState == 'accept') {
                allinvite = false;
              }
            });
            if (!allinvite) {
              cd.push(disease);
            }
          });
          // this.chronicDiseases = data.chronicDiseases;
          this.chronicDiseases = cd;
          this.profilePic = data.userProfilePic;
          let profile = this.userService.getProfile();
          this.userName = profile.firstName + ' ' + profile.lastName;

          this.circles = data.circles;
          this.campaigns = data.campaigns;
          this.composite_score = data.composite_score;
        });

      // platform.resume.subscribe ( (e) => {
      //   console.trace("resume called", e); 
      // });

      this.platform.resume.subscribe((e) => {
        // iOS
        if (this.platform.is('ios')) {
          this.fileCheckFunc();
        }
      });

      // platform.pause.subscribe ( (e) => {
      //   console.trace("pause called", e); 
      // });

      // this.webIntent.getIntent().then((data: any) => {
      //   // Use data from intent
      //   console.log("##received intent: ", data);
      //   if (data.extras) {
      //     this.nav.setRoot('AddMedRecordsPage', { extras: data.extras });
      //   }

      // }).catch((error: any) => console.log("##received error: ", error));

    });

    this.language_provider.$lang_observable
      .subscribe(lang_resource => {
        this.lang_resource = lang_resource;
        this.changeMenu();
      });

    // this.network.onDisconnect().subscribe(() => {
    //   this.helper.showAlert("Internet is disconnected on your device :-(", "");
    // });
  }

  ionViewDidLoad() {

  }

  ionViewDidEnter() {
    this.platform.ready().then(() => {
      this.keyboard.disableScroll(true);
    });
  }

  changeMenu() {
    this.pages_up = [
      { title: this.lang_resource.menu.omcoin_text, item_src: 'assets/imgs/HomeIcons/Reward_Main@3x.png', item_number: '', component: 'MyWalletPage' },
      { title: this.lang_resource.menu.med_text, item_src: 'assets/imgs/MenuIcons/_Records@2x.png', item_number: '', component: 'MyMedRecordsPage' }
    ];

    this.pages_middle = [
      { title: this.lang_resource.menu.device_text, item_src: 'assets/imgs/MenuIcons/connected_devices@2x.png', component: 'ConnectedDevicePage' },
      { title: this.lang_resource.menu.find_physician_text, item_src: 'assets/imgs/MenuIcons/Find_a_physician@2x.png', component: 'FindPhysicianPage' },
      { title: this.lang_resource.menu.Otp_text, item_src: 'assets/imgs/MenuIcons/lock@2x.png', component: 'OtpPage' },
    ]
    this.pages_down = [
      { title: this.lang_resource.menu.profile_text, item_src: 'assets/imgs/MenuIcons/_Profille@2x.png', component: 'EditProfilePage' },
      { title: this.lang_resource.menu.settings_text, item_src: 'assets/imgs/MenuIcons/settings@2x.png', component: 'SettingsPage' },
      { title: this.lang_resource.menu.help_text, item_src: 'assets/imgs/MenuIcons/help@2x.png', component: 'HelpPage' }
    ];
    this.page_login = { title: this.lang_resource.menu.logout_text, item_src: 'assets/imgs/MenuIcons/logout@2x.png', component: LoginPage };
  }

  getUserInfo(gender) {
    return new Promise((resolve) => {
      this.restService.getProfilePic(this.userService.getUserId())
        .subscribe(pic => {
          let imagePath: SafeResourceUrl;
          imagePath = this.domSanitizer.bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + pic.image);
          resolve(imagePath);
        }, error => {
          if (gender == 1 || gender == "1") {
            resolve("assets/imgs/HomeIcons/avatar_male_middle_01.png");
          } else {
            resolve("assets/imgs/HomeIcons/avatar_female_middle_01.png");
          }
          // this.foundError(error, 'getUserInfo');
        });
    });
  }

  update_profile() {
    this.nav.setRoot('EditProfilePage');
  }

  openHome() {
    this.nav.setRoot(HomePage);
  }

  openPage(page) {
    if (page.component == 'FindPhysicianPage' || page.component == 'ConnectedDevicePage' || page.component == 'HelpPage') {
      this.nav.push(page.component);
    } else {
      this.nav.setRoot(page.component);
    }
  }

  logout() {
    let logout_confirm = this.modalCtrl.create('ConfirmPopupPage', { 'title': "Confirm Log out", 'message': "Are you sure you want to log out from Health Wizz?", 'pos_text': "Log out", 'neg_text': "Cancel" }, { enableBackdropDismiss: false });
    logout_confirm.onDidDismiss(save_res => {
      if (save_res == true) {
        let lang = localStorage.getItem('language');
        this.userService.setUserId(null);
        localStorage.clear();
        // this.storage.clear();
        this.local.clearData();
        localStorage.setItem('language', lang);
        this.afAuth.auth.signOut();
        this.nav.setRoot(this.page_login.component);
        window.location.reload();
        return;
      }
    });
    logout_confirm.present();

  }

  goToChronicCampaigns(campaigns: Array<any>) {
    if (campaigns.length > 1) {
      this.local.setLocalCampaigns(campaigns);
      this.nav.setRoot('ChfCampaignPage');
    } else if (campaigns.length == 1) {
      let campaign = campaigns[0];
      if (campaign.campaignInfo.circleInfo.invitationState == 'accept') {
        this.local.setLocalCampaign(campaign);
        this.nav.setRoot('ChfPage', { 'campaign': campaign });
      } else {
        let modal = this.modalCtrl.create('ChfNotificationPage', { 'campaign': campaign }, { showBackdrop: true, enableBackdropDismiss: true });
        modal.present();
      }
    }
  }

  goToHealthIndex() {
    this.nav.setRoot('HealthIndexPage');
  }

  goToCircles() {
    this.nav.setRoot('MyCirclesPage');
    // try {
    //   if (this.circles.length >= 1) {
    //     this.nav.setRoot('MyCirclesPage');
    //   } else {
    //     this.nav.setRoot('WelcomeCirclePage');
    //   }
    // } catch (e) {
    //   console.log(e);
    // }
  }

  goToCampaigns() {
    this.local.setLocalCampaigns(this.campaigns);
    this.nav.setRoot('CampaignPage');
    // try {
    //   if (this.campaigns.length >= 1) {
    //     this.local.setLocalCampaigns(this.campaigns);
    //     this.nav.setRoot('CampaignPage');
    //   } else {
    //     this.nav.setRoot('CampaignNewPage');
    //   }
    // } catch (e) {
    //   console.log(e);
    // }
  }

  loadSplashImage() {
    let styles = {
      'background': "url('assets/imgs/custom-splash.png') no-repeat center"
    }

    return styles;
  }

  foundError(err, where) {
    console.log(where, err);
    console.log("network => ", this.network.type);
    if (!this.network.type || this.network.type == 'none') {
      this.toast.showLongTop("No internet connection!").subscribe(r => { });
    } else {
      this.toast.showLongTop("Can't reach to server!").subscribe(r => { });
    }
    // this.showSplash = false;
    // this.nav.setRoot(LoginPage);
    // this.platform.exitApp();
    // TODO: add error handing code like network disconnect of else.
  }

  fileCheckFunc() {
    this.file.checkFile(this.file.documentsDirectory, 'fileTitlename.txt')
      .then(_ => {
        console.log('@ file exists');

        // Read the real file name in the documentsDirectory of iPhone
        this.file.readAsText(this.file.documentsDirectory, 'fileTitlename.txt')
          .then(success => {
            console.log('# file url: ', success);

            this.copyFileToLocalDir(this.file.documentsDirectory, success, this.createPdfFileName());

          })
          .catch(err => {
            console.log('* file url reading error');
            // this.nav.setRoot('AddingMedRecordPage', {med_record_info: {"fileName": "Unknown", "fileType": "document"}});
          });
      })
      .catch(err => {
        console.log('**file doesnt exist');
      });
  }

  private copyFileToLocalDir(namePath, currentName, newFileName) {

    if (this.platform.is('android')) {
      this.file.copyFile(namePath, currentName, this.file.externalDataDirectory, newFileName).then(success => {
        this.nav.setRoot('AddingMedRecordPage', { med_record_info: { "fileName": newFileName, "fileType": "document" } });

        this.file.removeFile(this.file.documentsDirectory, 'fileTitlename.txt')
          .then(success => {
            console.log('successful remove temp file named fileTitlename.txt');
          })
          .catch(err => {
            console.log('can not remove temp file named fileTitlename.txt');
          })
      }, error => {
      });
    } else {
      this.file.copyFile(namePath, currentName, this.file.documentsDirectory, newFileName).then(success => {
        this.nav.setRoot('AddingMedRecordPage', { med_record_info: { "fileName": newFileName, "fileType": "document" } });

        this.file.removeFile(this.file.documentsDirectory, 'fileTitlename.txt')
          .then(success => {
            console.log('successful remove temp file named fileTitlename.txt');
          })
          .catch(err => {
            console.log('can not remove temp file named fileTitlename.txt');
          })
      }, error => {
      });
    }
  }

  private createPdfFileName() {
    var e = new Date(),
      m = e.getTime(),
      newFileName = m + ".pdf";
    return newFileName;
  }
}
