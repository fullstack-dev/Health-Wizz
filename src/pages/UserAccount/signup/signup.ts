import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides } from 'ionic-angular';
import { LoginPage } from '../login/login';
import { AngularFireAuth } from 'angularfire2/auth';
import { User } from 'firebase/app';
import { LoginService } from '../../../providers/login-service';
import { Helper } from '../../../providers/helper-service';
import { HttpService } from '../../../providers/http-service';
import { HomePage } from '../../home/home';
import { LanguageProvider } from '../../../providers/language/language';
import { ValidatorFn, AbstractControl, Validators, FormBuilder, AbstractControlDirective } from '@angular/forms';
import { ValidatorProvider } from '../../../providers/validator/validator';
import { Language } from '../../../models/classes';
import { Keyboard } from '@ionic-native/keyboard';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { LocalDataProvider } from '../../../providers/local-data/local-data';

@IonicPage()
@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
  providers: []
})

export class SignUpPage {
  federated_user: User;
  locale: string = 'en';
  is_federated_user = false;
  federated_user_info = null;
  federated_cred: any = null;
  user_data: UserData = new UserData();
  confirm_password: string = null;
  terms: boolean = false;
  policy: boolean = false;
  loader: any;
  errors: string[] = [];
  loginPage: any = null;
  c_privacy: boolean = false;
  c_notification: boolean = false;
  hippa: boolean = false;
  lang_resource: any;
  @ViewChild(Slides) slides: Slides;
  @ViewChild('slidePersonalForm') personalForm: AbstractControlDirective;
  @ViewChild('slideLocationForm') locationForm: AbstractControlDirective;

  oldLanguage: any;
  languages: Array<Language>;
  update_language: boolean;
  show_pager = true;
  states: string[];

  public slideRegistrationForm = this.formBuilder.group({
    email: ['', Validators.compose([
      Validators.required,
      Validators.pattern(this.validator.healthwizz_validator.email_pattern)
    ])],
    password: ['', Validators.compose([
      Validators.required,
      Validators.minLength(this.validator.healthwizz_validator.password_length),
      Validators.pattern(this.validator.healthwizz_validator.password_pattern)
    ])],
    confirm_password: ['', Validators.compose([
      Validators.required,
      this.equalTo('password')
    ])]
  });

  constructor(

    public navCtrl: NavController,
    public navParams: NavParams,
    private loginProvider: LoginService,
    private afAuth: AngularFireAuth,
    private helper: Helper,
    private http: HttpService,
    private language_provider: LanguageProvider,
    public formBuilder: FormBuilder,
    public validator: ValidatorProvider,
    public keyboard: Keyboard,
    private iab: InAppBrowser,
    public local: LocalDataProvider
  ) {
    this.states = local.contries[0].states;
    this.oldLanguage = localStorage.getItem('language');

    if (this.oldLanguage == null || this.oldLanguage == undefined) {
      this.locale = 'en';
    } else {
      this.locale = this.oldLanguage;
    }
    this.languages = this.language_provider.getAvailableLanguages();
    // this.name_validator = this.validator.name_validator;
    this.lang_resource = this.language_provider.getLanguageResource();
    this.loginPage = LoginPage;
    this.loadData();

  }

  ionViewDidLoad() {
    this.language_provider.$lang_observable
      .subscribe(lang_resource => {
        this.lang_resource = lang_resource;
      });

    this.keyboard.onKeyboardShow().subscribe(r => {
      this.show_pager = false;
    });

    this.keyboard.onKeyboardHide().subscribe(r => {
      this.show_pager = true;
    });

    setTimeout(() => {
      if (this.slides) {
        this.slides.lockSwipeToNext(true);
      }
    }, 300);
    // slide- 0
    this.slideRegistrationForm.statusChanges.subscribe(e => {
      this.enableForwardSlide(0, this.slideRegistrationForm.valid)
    });

    // slide -1
    this.personalForm.statusChanges.subscribe(e => {
      this.enableForwardSlide(1, this.personalForm.valid)
    });

    // slide-2
    this.locationForm.statusChanges.subscribe(e => {
      this.enableForwardSlide(2, this.locationForm.valid)
    });

    if (this.slides) {
      this.slides.ionSlideDidChange.subscribe(e => {
        switch (this.slides.getActiveIndex()) {
          case 0: this.enableForwardSlide(0, this.slideRegistrationForm.valid); return;
          case 1: this.enableForwardSlide(1, this.personalForm.valid); return;
          case 2: this.enableForwardSlide(2, this.locationForm.valid); return;
          default:
            break;
        }
      });
    }
  }

  enableForwardSlide(formIndex: number, enable: boolean) {
    if (this.slides) {
      if (formIndex == this.slides.getActiveIndex()) {
        this.slides.lockSwipeToNext(!enable);
      }
    }
  }

  requestLanguageChange() {
    this.language_provider.changeLanguage(this.locale);
  }

  countryChanged() {
    let country = this.local.contries.find(item => {
      return item.code == this.user_data.address.country
    });
    if (country) {
      this.states = country.states;
    } else {
      this.states = null;
      this.user_data.address.state = null;
    }
  }

  getMaxDob() {
    let date = new Date(new Date().setFullYear(new Date().getFullYear() - 16));
    let d: any = date.getDate();
    let m: any = date.getMonth() + 1;
    let y: any = date.getFullYear();
    if (d < 10) {
      d = "0" + d;
    }
    if (m < 10) {
      m = "0" + m;
    }
    return y + "-" + m + "-" + d;
  }

  getMinDob() {
    let date = new Date(new Date().setFullYear(new Date().getFullYear() - 100));
    let d: any = date.getDate();
    let m: any = date.getMonth() + 1;
    let y: any = date.getFullYear();
    if (d < 10) {
      d = "0" + d;
    }
    if (m < 10) {
      m = "0" + m;
    }
    return y + "-" + m + "-" + d;
  }

  loadData() {
    this.user_data.address.state = "e"; //default state
    this.user_data.address.country = "US" //default country
    this.federated_user = this.loginProvider.getCurrentUser();
    if (this.federated_user != null) {
      try {
        this.is_federated_user = true;
        this.loginProvider.getCredential()
          .then(cred => {
            this.federated_cred = cred;
            this.loginProvider.getUserInfo()
              .then(info => {
                this.federated_user_info = info;
                this.fillData();
              });
          });
      } catch (e) {
        console.log(e);

      }
    } else {
      this.user_data.gender = ""; // default gender
      // this.user_data.dob = this.getMaxDob(); // default dob
      this.user_data.dob = "";
    }
  }

  equalTo(fieldName): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {

      let input = control.value;

      let isValid = control.root.value[fieldName] == input
      if (!isValid)
        return { 'equalTo': { isValid } }
      else
        return null;
    };
  }

  fillData() {
    const profile = this.federated_user_info.profile;
    this.user_data.providerId = this.federated_user_info.providerId;
    this.user_data.verified = this.federated_user.emailVerified;
    this.user_data.uid = this.federated_user.uid;
    // this.user_data.email = profile.email;
    this.user_data.email = this.federated_user.email;

    // this.slideRegistrationForm.value.email =  profile.email;
    // this.slideRegistrationForm.value.email = this.federated_user.email;
    this.slideRegistrationForm.patchValue({ email: this.federated_user.email });

    this.user_data.isFederated = true;
    if (this.federated_user_info.providerId === 'google.com') {
      this.user_data.lastName = profile.family_name;
      this.user_data.firstName = profile.given_name;
      // this.user_data.verified = profile.verified_email;
      // get google profile of federated user
      this.http.getGoogleProfile(this.federated_cred.accessToken)
        .subscribe(g_profile => {
          console.log(g_profile);
          if (g_profile.birthday) {
            this.user_data.dob = g_profile.birthday;
          }
        });

    } else if (this.federated_user_info.providerId === 'facebook.com') {
      this.user_data.lastName = profile.last_name;
      this.user_data.firstName = profile.first_name;
      // this.user_data.verified = profile.verified;

      if (profile.gender === 'male') {
        this.user_data.gender = "1";
      } else {
        this.user_data.gender = "2";
      }
    }
  }

  get disableEmail() {
    if (this.federated_user) {
      if (this.slideRegistrationForm.value.email) {
        return true;
      }
    }
    return false;
  }

  attemptRegister() {
    this.user_data.email = this.slideRegistrationForm.value.email;
    this.user_data.password = this.slideRegistrationForm.value.password;

    this.helper.showLoading();
    if (this.is_federated_user == false) {
      this.loginProvider.checkEmail(this.user_data.email)
        .then(r_check => {
          console.log('email check result', r_check);
          if (r_check === false) {
            this.helper.hideLoading();
            this.helper.showAlert('This email is already registered with us.', 'Email already exsists');
            return;
          } else {
            this.loginProvider.createUserWithPassword(this.user_data.email, this.user_data.password)
              .then(user => {
                this.helper.hideLoading();
                this.registerWithFirebase(user, 1);
              }).catch(e => {
                this.helper.hideLoading();
                this.retryRegister(this.federated_user, 1, false, false, false)
              });
          }
        }, err => {
          this.helper.hideLoading();
          this.helper.showAlert("Something went wrong, please try again.", "");
        });
    } else {
      // already created on firebase
      this.helper.hideLoading();
      this.registerWithFirebase(this.federated_user, 1);
    }

  }

  registerWithFirebase(user: User, retry_count: number) {
    if (retry_count > 3) {
      this.helper.showAlert('Too many unsuccessful attempts.Please contact Health Wizz support at support@healthwizz.com', 'Registration Failed!');
      this.afAuth.auth.currentUser.delete();
      this.navCtrl.setRoot(LoginPage);
      return;
    }
    this.user_data.consents.push(new ConsentDTO('PP', this.c_privacy));
    this.user_data.consents.push(new ConsentDTO('EM', this.c_notification));

    if (user.emailVerified === true) {
      this.helper.showLoading();
      this.loginProvider.saveUser(user)
        .then(r_save => {
          this.helper.hideLoading();
          // this.helper.showLoading();
          this.registerWithHealthwizz(user, retry_count, true);
        }).catch(e => {
          this.helper.hideLoading();
          this.retryRegister(user, retry_count, true, false, false);
        });
      return;
    }
    this.helper.showLoading();
    this.loginProvider.sendVerificationMail(user)
      .then(r_send => {
        this.loginProvider.saveUser(user)
          .then(r_save => {
            this.helper.hideLoading();
            this.registerWithHealthwizz(user, retry_count, false);
          }).catch(e => {
            this.helper.hideLoading();
            this.retryRegister(user, retry_count, true, false, false);
          });
      }).catch(e => {
        this.helper.hideLoading();
      });
  }

  public registerWithHealthwizz(user: User, retry_count: number, login: boolean) {
    if (retry_count > 3) {
      this.helper.showAlert('Too many unsuccessful attempts.Please contact Health Wizz support at support@healthwizz.com', 'Registration Failed!');
      this.afAuth.auth.currentUser.delete();
      this.navCtrl.setRoot(LoginPage);
      return;
    }
    this.helper.showLoading();
    const link = 'register?locale=' + this.locale;
    this.http.registerWithHealthwizz(link, this.user_data)
      .then(result => {
        if (result.success === true) {
          this.helper.hideLoading();
          if (login == true) {
            //FIXME: auto login the user
            this.navCtrl.setRoot(LoginPage);
            this.helper.showAlert('Your Health Wizz registration is sucessfull.Login again to continue.', '');
          } else {
            this.navCtrl.setRoot(LoginPage);
            this.helper.showAlert('A verification email has been sent to the registered email ID.', '');
          }

        } else {
          this.helper.hideLoading();
          this.retryRegister(user, retry_count, true, true, login);
        }
      }, error => {
        this.helper.hideLoading();
        this.retryRegister(user, retry_count, true, true, login);
      });
  }

  public retryRegister(user: User, retry_count: number, isFbCreated: boolean, isFbSaved: boolean, login: boolean) {
    this.helper.showConfirm('Try again?', 'Registration unsuccessful.', 'YES', 'NO')
      .then(() => {
        if (isFbCreated == false) {
          this.attemptRegister();
        } else {
          if (isFbSaved == true) {
            this.registerWithHealthwizz(user, (retry_count + 1), login)
          } else {
            this.registerWithFirebase(user, (retry_count + 1));
          }
        }
      }).catch(e => {
        this.afAuth.auth.currentUser.delete();
        this.navCtrl.setRoot(LoginPage);
      });
  }

  public changeNotConsent() {
    this.c_notification = !this.c_notification;
  }

  public changePPConsent() {
    this.c_privacy = !this.c_privacy;
  }

  public goToLogin = () => {
    this.navCtrl.pop();
  }

  public goToNext = () => {
    this.slides.slideNext();
  }

  public goToHome = () => {
    //
    this.navCtrl.setRoot(HomePage);
  }

  openLinkWellness(mhi) {
    let url = this.http.getServiceUri();
    let link = url + mhi;
    link = 'https://docs.google.com/viewer?url=' + encodeURIComponent(link);
    const browser = this.iab.create(link, "_blank", "location=no")
  }

  showPasswordPolicy() {
    this.helper.showAlert("The password you enter should be 6 character long and should have at least one uppercase letter, one digit and one special character.", "");
  }
}

class UserData {
  public email: string = null;
  public password: string = null;
  public firstName: string = null;
  public lastName: string = null;
  public dob: string = null;
  public gender: string = null;
  public address: AddressDTO = new AddressDTO(null, null, null, null, null, null);
  public cell: string = null;
  public promoCode: string = null;
  public hasPrimaryPhysician: boolean = null;
  public hasInsurance: boolean = null;
  public consents: Array<ConsentDTO> = [];
  public pharmacy: Array<PharmacyDTO> = [];
  public insurance: Array<InsuranceDTO> = [];
  public uid: string = null;
  public providerId: string = null;
  public verified: boolean = null;
  public isFederated: boolean = null;
  constructor() { }
}

class AddressDTO {
  // TODO: make a country property
  constructor(
    public addressLine1: string,
    public addressLine2: string,
    public city: string,
    public zipCode: string,
    public state: string,
    public country: string
  ) { }
}

class ConsentDTO {
  constructor(
    public code: string,
    public value: boolean
  ) { }
}

class PharmacyDTO {
  constructor(
    public code: string,
    public name: string,
    public type: string
  ) { }
}

class InsuranceDTO {
  constructor(
    public code: string,
    public providedId: string,
    public type: string
  ) { }
}
