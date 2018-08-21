import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { User } from 'firebase/app';
import { LoginService } from '../../../providers/login-service';
import { Helper } from '../../../providers/helper-service';
import { LoginPage } from '../login/login';
import { AngularFireAuth } from 'angularfire2/auth';
import { LanguageProvider } from '../../../providers/language/language';

@IonicPage()
@Component({
  selector: 'page-accountlink',
  templateUrl: 'accountlink.html',
})
export class AccountlinkPage {

  user: User
  pendingCredential: any;
  providers: any = [];
  email: any;
  has_email: boolean = false;
  title: string = 'Verify Email';
  lang_resource: any;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    private loginProvider: LoginService,
    private helper: Helper,
    private afAuth: AngularFireAuth,
    private alertCtrl: AlertController,
    private language_provider: LanguageProvider
  ) {
    this.lang_resource = this.language_provider.getLanguageResource();
    if (navParams.data.email != null && navParams.data.cred != null) {
      this.helper.showLoading(); //start loading-1
      this.pendingCredential = navParams.data.cred;
      this.email = navParams.data.email;
      this.has_email = true;
      this.title = 'Select a Provider';
      this.loginProvider.fetchProviders(this.email)
        .then(f_result => {
          this.helper.hideLoading(); //finish loading-1
          this.providers = f_result;
        });
    } else {
      this.user = navParams.data.user;
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AccountlinkPage');
  }

  verify() {
    this.helper.showLoading(); //start loading-2
    this.loginProvider.checkEmail(this.email)
      .then(r => {
        if (r == false) {
          this.helper.hideLoading();
          this.helper.showAlert('Email ID is already registered with another account.', 'Account Exist!');
          this.email = "";
          return;
        }
        this.user.updateEmail(this.email)
          .then(r1 => {
            this.loginProvider.sendVerificationMail(this.user)
              .then(v_r => {
                this.helper.hideLoading();
                this.helper.showAlert('A verification email has been sent to your email ID.', 'Email updated');
                this.afAuth.auth.signOut();
                this.viewCtrl.dismiss();
              }).catch(e => {
                this.foundError(e, 'sending verification email');
              });
          }).catch(e => {
            this.helper.hideLoading(); //finish loading-2
            if (e.code) {
              switch (e.code) {
                case 'auth/email-already-in-use':
                  this.helper.showAlert('Email ID already registered with another account.', 'Account Exist!');
                  this.email = "";
                  break;
                case 'auth/invalid-email':
                  this.helper.showAlert('Email ID you entered is not valid.', 'Invalid Email!');
                  break;
                case 'auth/user-mismatch':
                  this.afAuth.auth.signOut();
                  this.helper.showAlert('Something is not right with your account. Please try again.', 'Verification Failed.');
                  this.navCtrl.setRoot(LoginPage);
                  break;
                case 'auth/requires-recent-login':
                  this.afAuth.auth.signOut();
                  this.helper.showAlert('Your session has expired. Please login again.', 'Verification Failed.');
                  this.navCtrl.setRoot(LoginPage);
                  break;
                default:
                  break;
              }
            }
          });
      }).catch(e => {
        this.foundError(e, 'checking email');
      });
  }

  attemptLink(providerId) {
    switch (providerId) {
      case 'google.com':
        this.linkWithProvider(this.loginProvider.getGoogleProvider());
        break;
      case 'facebook.com':
        this.linkWithProvider(this.loginProvider.getFacebookProvider());
        break;
      case 'twitter.com':
        this.linkWithProvider(this.loginProvider.getTwitterProvider());
        break;
      case 'password':
        this.linkWithPassword();
        break;
      default:
        break;
    }
  }

  linkWithProvider(provider) {
    this.helper.showLoading(); //start loading-3
    this.loginProvider.signInWithRedirect(provider)
      .then(l_result => {
        this.linkAccounts();
      }).catch(e => {
        this.foundError(e, 'sign in with redirect');
      });
  }

  linkWithPassword() {
    let alert = this.alertCtrl.create({
      title: 'Login',
      inputs: [
        {
          name: 'password',
          placeholder: '',
          type: 'password'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Login',
          handler: data => {
            if (data.password) {
              this.helper.showLoading(); //start loading-3
              this.loginProvider.signInWithPassword(this.email, data.password)
                .then(result => {
                  this.linkAccounts();
                }).catch(e => {
                  this.foundError(e, 'sign in with password');
                });
            }
          }
        }
      ]
    });
    alert.present();
  }

  linkAccounts() {
    //continue loading-3
    const user = this.loginProvider.getCurrentUser();
    user.linkWithCredential(this.pendingCredential)
      .then(data => {
        this.helper.hideLoading();
        this.helper.showAlert('Accounts are now linked, you can now login with any of your accounts.', 'Success');
        this.afAuth.auth.signOut();
        this.viewCtrl.dismiss();
      }).catch(e => {
        this.foundError(e, 'link with credential');
      });
  }

  dismiss() {
    this.helper.showConfirm('Cancel operation?', 'You have to login again for email verification.', 'OK', 'Cancel')
      .then(c_result => {
        const user = this.afAuth.auth.currentUser;
        user.delete()
          .then(() => {
            this.viewCtrl.dismiss();
          }).catch(e => {
            this.viewCtrl.dismiss();
          });
      }).catch(e => {

      });
  }

  foundError(e: any, where: string) {
    console.error('found an error in ' + where, e);
    this.helper.hideLoading();
  }

}
