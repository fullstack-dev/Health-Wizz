import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { FormBuilder } from '@angular/forms';
import { AngularFireAuth } from 'angularfire2/auth';
import { Helper } from '../../../providers/helper-service';
import { LoginService } from '../../../providers/login-service';
import { HttpService } from '../../../providers/http-service';
import { LanguageProvider } from '../../../providers/language/language';
@IonicPage()
@Component({
  selector: 'page-request-password',
  templateUrl: 'request-password.html',
})
export class RequestPasswordPage {
  passwordRequested: boolean = false;
  email: any;
  locale: string = 'en';
  lang_resource: any;
  constructor(
    public navCtrl: NavController,
    public fb: FormBuilder,
    private afAuth: AngularFireAuth,
    private helper: Helper,
    private loginProvider: LoginService,
    private http: HttpService,
    private language_provider: LanguageProvider
  ) {
    this.lang_resource = this.language_provider.getLanguageResource();
  }

  public request = () => {
    if (this.email == null || this.email == undefined) {
      return;
    }
    if (localStorage.getItem('preferLanguage') === 'english') {
      this.locale = 'en';
    } else {
      this.locale = 'es';
    }
    this.afAuth.auth.sendPasswordResetEmail(this.email)
      .then(() => {
        this.resetSuccess();
      })
      .catch(error => {
        if (error.code === 'auth/user-not-found') {
          // TODO: check user on backend if found send mail form there
          this.loginProvider.checkEmail(this.email)
            .then(r => {
              if (r == false) {
                const link = 'forgotPassword?emailId=' + this.email + '&locale=' + this.locale;
                this.http.get(link)
                  .subscribe(result => {
                    this.resetSuccess();
                  });
              } else {
                this.helper.showAlert('No user found with this email.', 'Not found!');
              }
            });
        } else if (error.code === 'auth/invalid-email') {
          this.helper.showAlert('Email Id is not valid.', 'Invalid');
        } else {
          this.helper.showAlert('Cannot connect to internet or server', 'Try again!');
        }
      });
  }

  public resetSuccess = () => {
    this.helper.showAlert('Password reset email has been sent.', 'Success!');
    this.navCtrl.pop();
  }

  public goBack = () => {
    this.navCtrl.pop();
  }
}
