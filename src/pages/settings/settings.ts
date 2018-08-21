import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { LanguageProvider } from '../../providers/language/language';
import { Language, UserSettings } from '../../models/classes';
import { Helper } from '../../providers/helper-service';
import { LocalDataProvider } from '../../providers/local-data/local-data';
import { RestDataProvider } from '../../providers/rest-data-service/rest-data-service';
@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {
  lang_resource: any;
  oldLanguage: any;
  selectedLanguage: any;
  languages: Array<Language>;
  update_language: boolean;

  small_font: boolean;
  middle_font: boolean;
  large_font: boolean;

  general: boolean;
  circle: boolean;
  campaigns: boolean;
  disease: boolean;
  other: boolean;
  ageVisible: boolean;
  locationVisible: boolean;
  circleVisible: boolean;
  challengesVisible: boolean;
  indexVisible: boolean;
  otherVisible: boolean;
  // wallet_settings: WalletSettings;

  userSettings: UserSettings

  constructor(
    public navCtrl: NavController,
    private alertCtrl: AlertController,
    public navParams: NavParams,
    private language_provider: LanguageProvider,
    public helper: Helper,
    public local: LocalDataProvider,
    private restService: RestDataProvider
  ) {
    this.lang_resource = this.language_provider.getLanguageResource();
    this.oldLanguage = localStorage.getItem('language');
    if (this.oldLanguage == null || this.oldLanguage == undefined) {
      this.selectedLanguage = 'en';
    } else {
      this.selectedLanguage = this.oldLanguage;
    }

    this.languages = language_provider.getAvailableLanguages();

    this.middle_font = true;
    this.small_font = false;
    this.large_font = false;

    this.general = true;
    this.circle = false;
    this.campaigns = true;
    this.disease = false;
    this.other = true;
    this.ageVisible = true;
    this.locationVisible = false;
    this.circleVisible = true;
    this.challengesVisible = false;
    this.indexVisible = true;
    this.otherVisible = false;

    this.userSettings = new UserSettings(null, null, true, false, false, true, true);
  }

  ionViewDidLoad() {
    this.language_provider.$lang_observable
      .subscribe(lang_resource => {
        this.lang_resource = lang_resource;
      });
    this.getUserSettings();

  }

  getUserSettings() {
    this.restService.getPersonalSettings()
      .subscribe(r => {
        if (r) {
          this.userSettings = r;
        }
      }, e => {
        console.log(e);
      });
  }

  saveSettings() {
    return this.restService.savePersonalSettings(this.userSettings);
  }

  requestLanguageChange() {
    if (this.selectedLanguage == this.oldLanguage) {
      this.update_language = false;
    } else {
      this.update_language = true;
    }
  }

  openWalletDurationInput() {
    let alert = this.alertCtrl.create({
      title: 'Set wallet unlock duration',
      inputs: [
        {
          name: 'unlock_time',
          placeholder: 'minutes',
          type: 'number'
        }],
      buttons: [{
        text: 'Ok',
        handler: (data) => {

          this.language_provider.updateWalletSettings(data.unlock_time);
          // let navTransition = alert.dismiss();

          // this.asyncOperation(data.unlock_time).then(() => {

          //   navTransition.then(() => {

          //   });
          // });
          // return false;
        }
      }, {
        text: "Cancel",
        role: 'cancel',
        handler: () => {
          console.log("cancelled");
        }
      }]
    });

    alert.present();
  }

  // asyncOperation(duration) {
  //   return new Promise((resolve) => {
  //     setTimeout(() => {
  //       console.log(duration);
  //       this.wallet_duration = duration;
  //       resolve();
  //     }, 1000);
  //   });
  // }

  public Before = () => {
    this.navCtrl.setRoot('HomePage');
  }

  public Done = () => {
    if (this.update_language == true) {
      this.oldLanguage = this.selectedLanguage;
      this.language_provider.changeLanguage(this.selectedLanguage);
    }

    this.saveSettings()
      .subscribe(r => {
        console.log(r);
        this.helper.showAlert("Settings updated.", "Success!");
        this.navCtrl.setRoot('HomePage');
      }, e => {
        console.error(e);
        this.helper.showAlert("Failed to update settings.", "Failed!");
      })

  }

  public font_small() {

    this.middle_font = false;
    this.small_font = true;
    this.large_font = false;

    document.querySelector("html").style.fontSize = "8px";
  }

  public font_middle() {
    this.middle_font = true;
    this.small_font = false;
    this.large_font = false;

    document.querySelector("html").style.fontSize = "12px";
  }

  public font_large() {
    this.middle_font = false;
    this.small_font = false;
    this.large_font = true;

    document.querySelector("html").style.fontSize = "16px";
  }

  setSmallStyles(item) {
    if (item) {
      let styles = {
        'color': 'white',
        'background-color': '#48C5CD'
      };
      return styles;
    } else {
      let styles = {
        'color': '#82827F',
        'background-color': 'white'
      };
      return styles;
    }
  }

  setMiddleStyles(item) {
    if (item) {
      let styles = {
        'color': 'white',
        'background-color': '#48C5CD'
      };
      return styles;
    } else {
      let styles = {
        'color': '#82827F',
        'background-color': 'white'
      };
      return styles;
    }
  }

  setLargeStyles(item) {
    if (item) {
      let styles = {
        'color': 'white',
        'background-color': '#48C5CD'
      };
      return styles;
    } else {
      let styles = {
        'color': '#82827F',
        'background-color': 'white'
      };
      return styles;
    }
  }
}
