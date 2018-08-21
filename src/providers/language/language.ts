import { Injectable } from '@angular/core';
import { Language } from '../../models/classes';
import { Rest } from '../rest';
import { Subject } from 'rxjs';
import { WalletSettings } from '../../models/interfaces';
@Injectable()
export class LanguageProvider {

  private languages: Array<Language>;
  private lang_notifier = new Subject<any>();
  private wallet_settings = new Subject<WalletSettings>();
  $wallet_settings = this.wallet_settings.asObservable();
  public lang_resource: any;
  $lang_observable = this.lang_notifier.asObservable();
  constructor(
    public rest: Rest
  ) {

  }

  getAvailableLanguages(): Array<Language> {
    return this.languages;
  }

  parseLanguages() {
    this.rest.getLanguages()
      .subscribe(data => {
        this.languages = data.lang;
        this.setDefaultLanguage();
      });
  }

  setDefaultLanguage() {
    try {
      let default_lang = localStorage.getItem('language');
      if (default_lang == null && default_lang == undefined) {
        localStorage.setItem('language', 'en');
        default_lang = "en";
      }

      this.changeLanguage(default_lang);

    } catch (e) {
      console.log(e);
    }
  }

  changeLanguage(lang_code: string) {
    try {
      if (lang_code == null || lang_code == undefined) {
        return;
      }
      let res_url = null;

      this.languages.forEach(lang => {
        if (lang.code == lang_code) {
          res_url = lang.res_url;
        }
      });

      if (res_url == null) {
        res_url = "assets/data/strings_en.json";
      }

      this.rest.getLangResource(res_url)
        .subscribe(langRes => {
          localStorage.setItem('language', lang_code);
          this.lang_resource = langRes;
          this.notifyLanguageChange();
        });

    } catch (e) {
      console.log(e);
    }
  }

  notifyLanguageChange() {
    this.lang_notifier.next(this.lang_resource);
  }

  getLanguageResource() {
    return this.lang_resource;
  }

  updateWalletSettings(time: number) {
    this.wallet_settings.next(<WalletSettings>{ unlock_time: time });
  }

}
