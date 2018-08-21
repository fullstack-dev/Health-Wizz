import { Component } from '@angular/core';
import { Platform, NavController, ToastController, MenuController, ModalController } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';
import { Rest } from '../../../providers/rest';
import { AngularFireAuth } from 'angularfire2/auth';
import { LoginService } from '../../../providers/login-service';
import { Helper } from '../../../providers/helper-service';
import { HttpService } from '../../../providers/http-service';
import { HomePage } from '../../home/home';
import { UserService } from '../../../providers/user-service';
import { RestDataProvider } from '../../../providers/rest-data-service/rest-data-service';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})

export class LoginPage {
  fb_user: any;
  pushPage: any = null;
  forgetPassword: any = null;
  // users: any;
  lang_resource: any;
  errorMessage: string;
  loader: any = null;
  fb_cred = new Credentials(null, false, null, null);
  user_cred = {
    emailID: '',
    password: ''
  }
  public loginForm = this.fb.group({
    email: [null, Validators.compose([Validators.required])],
    password: [null, Validators.compose([Validators.required])]
  });

  constructor(
    public navCtrl: NavController,
    public fb: FormBuilder,
    public toastCtrl: ToastController,
    public rest: Rest,
    private menu: MenuController,
    private afAuth: AngularFireAuth,
    private loginProvider: LoginService,
    private helper: Helper,
    private httpService: HttpService,
    public modalCtrl: ModalController,
    public userService: UserService,
    private restService: RestDataProvider,
    public domSanitizer: DomSanitizer,
    private platform: Platform
  ) {
    this.pushPage = 'SignUpPage';
    this.forgetPassword = 'RequestPasswordPage';
  }

  public signout() {
    this.afAuth.auth.signOut();
  }

  ionViewDidEnter() {
    this.menu.swipeEnable(false);
  }

  ionViewWillLeave() {
    this.menu.swipeEnable(true);
    this.platform.ready().then(() => {
    });
  }

  public goToFacebook = () => {
    this.helper.showLoading(); //loading starts
    this.signIn(this.loginProvider.getFacebookProvider());
  }

  public goToGoogle = () => {
    this.helper.showLoading(); //loading starts
    this.signIn(this.loginProvider.getGoogleProvider());
  }

  public goToTwitter = () => {
    this.helper.showLoading(); //loading starts
    this.signIn(this.loginProvider.getTwitterProvider());
  }

  public goToLinkedin = () => {
    const client = {
      client_id: '81hsopxpges257',
      client_secret: 'tAA4fBjCkhF1FV5z',
      redirect_uri: 'http://localhost/callback'
    }
    let ref = window.open('https://www.linkedin.com/oauth/v2/authorization?' +
      'client_id=' + client.client_id +
      '&redirect_uri=' + client.redirect_uri +
      '&scope=r_basicprofile%20r_emailaddress%20rw_company_admin%20w_share' +
      '&response_type=code' +
      '&state=474629469342934857946' +
      '&access_type=offline', '_blank', 'location=no');

    let requestToken;
    let code;
    ref.addEventListener('loadstart', (event: any) => {
      this.helper.showLoading();
      if ((event.url).startsWith(client.redirect_uri)) {
        requestToken = (event.url).split("code=")[1];
        console.log('token', requestToken);
        ref.close();
        if (requestToken !== undefined) {
          // alert("linked in logged in.");
          code = requestToken.split("&state=")[0];
          console.log('code', code);
          // this.getAccessToken(code, client);
          this.httpService.getLinkedInAccessToken(code, client)
            .subscribe(result => {
              this.httpService.getLinkedInProfile(result.access_token)
                .subscribe(profile => {
                  this.helper.hideLoading();
                  console.log(profile);
                }, err => {
                  this.foundError(err, 'gotolinkedin');
                });
            }, err => {
              this.foundError(err, 'gotolinkedin');
            });
        } else {
          this.helper.hideLoading();
        }
      } else {
        this.helper.hideLoading();
      }
    });
  }

  public signIn(provider) {
    //loading continues...
    this.loginProvider.signInWithRedirect(provider)
      .then(fb_result => {
        console.log(fb_result);
        //loading continues...
        this.verifyUser();
      }).catch(e => {
        this.foundError(e, 'signIn');
      });
  }

  public verifyUser() {
    //loading continues...
    let credential;
    this.loginProvider.getCredential()
      .then(cred => {
        credential = cred;
      });
    const user = this.loginProvider.getCurrentUser();
    if (user.email === null) {
      this.helper.hideLoading();
      let linkModal = this.modalCtrl.create('AccountlinkPage', {
        user: user,
        cred: null,
        email: null
      });
      linkModal.present();
      return;
    }
    this.loginProvider.verifyUser(user)
      .then(result => {
        console.log(result);

        switch (result) {
          case 'VERIFIED':
            this.loginProvider.getIdToken(user)
              .then(id_token => {
                console.log(id_token);
                this.fb_cred = new Credentials(id_token, true, user.uid, credential.providerId);
                // loading continues...
                this.attemptLogin(false);
              }).catch(e => {
                this.foundError(e, 'verifyUser');
              });

            break;
          case 'UNVERIFIED':
            this.helper.showConfirm('Verify your email', 'Please verify your email by clicking on the link sent to your email.If you want another verification link please select YES.', 'YES', 'NO')
              .then(r1 => {
                this.loginProvider.sendVerificationMail(user)
                  .then(r2 => {
                    this.helper.hideLoading(); //finish loading
                    this.helper.showAlert('A verification email has been sent to the email ID registered with Health Wizz.', '');
                  }).catch(e => {
                    this.foundError(e, 'verifyUser');
                  });
              }).catch(e => {
                this.helper.hideLoading(); //finish loading
              });
            break;
          case 'NEW':
            this.loginProvider.checkEmail(user.email)
              .then(r => {
                if (r == false) {
                  // User found
                  if (user.emailVerified == true) {
                    this.loginProvider.saveUser(user)
                      .then(s_r => {
                        // TODO: proceed to login/ get idtoken
                        this.loginProvider.getIdToken(user)
                          .then(id_token => {
                            console.log(id_token);
                            this.fb_cred = new Credentials(id_token, true, user.uid, credential.providerId);
                            // loading continues...
                            this.attemptLogin(false);
                          }).catch(e => {
                            this.foundError(e, 'verifyUser');
                          });
                      }).catch(e => {
                        this.foundError(e, 'verifyUser');
                      })
                  } else {
                    this.loginProvider.sendVerificationMail(user)
                      .then(r3 => {
                        this.loginProvider.saveUser(user)
                          .then(r4 => {
                            this.helper.hideLoading();
                            this.helper.showAlert('A verification email has been sent. Please check your email.', 'Success!');
                          }).catch(e => {
                            this.foundError(e, 'verifyUser');
                          });
                      }).catch(e => {
                        this.foundError(e, 'verifyUser');
                      });
                  }
                } else {
                  this.helper.hideLoading();
                  this.navCtrl.push('SignUpPage');
                }
              }).catch(e => {
                this.foundError(e, 'verifyUser');
              });
            break;

          default:
            break;
        }
      });
  }

  public attemptLogin = (startLoading: boolean) => {
    if (this.fb_cred.federatedLogin == false && (this.loginForm.value.email == null || this.loginForm.value.email == undefined || this.loginForm.value.password == null || this.loginForm.value.password == undefined)) {
      this.helper.showAlert("Please enter a valid email and password.", "");
      return;
    }
    if (startLoading == true) {
      this.helper.showLoading();
    }
    // loading continues...    
    this.user_cred.emailID = this.loginForm.value.email;
    this.user_cred.password = this.loginForm.value.password;
    try {
      if (this.fb_cred.federatedLogin === false) {
        this.loginProvider.signInWithPassword(this.user_cred.emailID, this.user_cred.password)
          .then(user => {
            this.loginProvider.verifyUser(user)
              .then(r5 => {
                switch (r5) {
                  case 'VERIFIED':
                    //loading continues...
                    this.authenticateUser(this.user_cred);
                    break;
                  case 'UNVERIFIED':

                    this.helper.showConfirm('Verify your email', 'Please verify your email by clicking on the link sent to your email.If you want another verification link please select YES.', 'YES', 'NO')
                      .then(r6 => {
                        this.loginProvider.sendVerificationMail(user)
                          .then(r7 => {
                            this.helper.hideLoading(); //finish loading
                            this.helper.showAlert('A verification email has been sent to the email ID registered with Health Wizz', '');
                          }).catch(e => {
                            this.foundError(e, 'attemptLogin');
                          });
                      }).catch(e => {
                        this.helper.hideLoading();
                      });
                    break;
                  case 'NEW':
                    this.loginProvider.checkEmail(user.email)
                      .then(r8 => {
                        if (r8 == false) {
                          // User found
                          if (user.emailVerified == true) {
                            this.loginProvider.saveUser(user)
                              .then(s_r => {
                                // TODO: proceed to login/ get idtoken
                                this.loginProvider.getIdToken(user)
                                  .then(id_token => {
                                    console.log(id_token);
                                    // this.fb_cred = new Credentials(id_token, true, user.uid, this.user_cred.providerId);
                                    // loading continues...
                                    this.attemptLogin(false);
                                  }).catch(e => {
                                    this.foundError(e, 'verifyUser');
                                  });
                              }).catch(e => {
                                this.foundError(e, 'verifyUser');
                              })
                          } else {
                            this.loginProvider.sendVerificationMail(user)
                              .then(r9 => {
                                this.loginProvider.saveUser(user)
                                  .then(r10 => {
                                    this.helper.hideLoading();
                                    this.helper.showAlert('A verification email has been sent. Please check your email.', 'Success!');
                                  }).catch(e => {
                                    this.foundError(e, 'verifyUser');
                                  });
                              }).catch(e => {
                                this.foundError(e, 'verifyUser');
                              });
                          }
                        } else {
                          this.helper.hideLoading();
                          this.navCtrl.push('SignUpPage');
                        }
                      }).catch(e => {
                        this.foundError(e, 'verifyUser');
                      });
                    break;
                  case 'Error':
                    this.foundError('Error', 'attemptLogin')
                    break;
                  default:
                    break;
                }
              }).catch(e => {
                this.foundError(e, 'attemptLogin');
              });;
          }).catch(e => {
            this.foundError(e, 'attemptLogin');
          });
      } else if (this.fb_cred.federatedLogin === true) {
        // TODO: authenticate user with backend (fb_Cred)
        console.log(this.fb_cred);
        //loding continues...
        this.authenticateUser(this.fb_cred);
      }
    } catch (e) {
      console.log(e);
      this.foundError(e, 'attemptLogin');
    }

  }

  public authenticateUser = (credentials) => {
    //loading continues...
    console.log(credentials);
    this.httpService.signInWithHealthwizz('authenticate', credentials)
      .subscribe(res => {
        console.log(res);
        //loading continues...
        localStorage.setItem('authToken', res.data.authToken);
        localStorage.setItem('userId', res.data.userId);
        this.userService.setUserId(res.data.userId);
        // this.userService.resolveUserId(res.data.userId);
        this.goToHome(res);
      }, err => {
        this.foundError(err.json(), 'authenticateUser');
      });
  }

  public goToHome(response) {
    try {
      if (response.data.userId != null && response.success == true) {
        this.httpService
          .getProfile()
          .subscribe(profile => {
            this.getUserInfo(profile.data.gender)
              .then(picUrl => {
                // finish loading
                this.helper.hideLoading();
                this.userService.setProfilePic(picUrl);
                this.userService.setProfile(profile.data);
                // this.myWallet.updateWalletStatus();
                this.navCtrl.setRoot(HomePage, { from: 'login' });
              }, err => {
                this.foundError(err, 'goToHome');
              });
          }, error => {
            this.foundError(error, 'goToHome');
          });
      } else {
        this.helper.hideLoading();
        this.helper.showAlert("Some error when logging in.", '');
      }
    } catch (e) {
      this.helper.hideLoading();
      this.helper.showAlert("Some error when logging in.", '');
    }
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

  public createFBUser() {
    this.loginProvider.checkEmail(this.user_cred.emailID)
      .then(r => {
        if (r == false) {
          this.helper.showConfirm('Re-Verify!', 'You must verify your identity. Verify now?', 'YES', 'NO')
            .then(c_r => {
              this.loginProvider.createUserWithPassword(this.user_cred.emailID, this.user_cred.password)
                .then(() => {
                  // const user = this.loginProvider.getCurrentUser();
                  const user = this.afAuth.auth.currentUser;
                  user.sendEmailVerification().then(() => {
                    this.loginProvider.saveUser(user)
                      .then(s_r => {
                        this.helper.showAlert('A verification email sent you. Please check your email.', 'Success');
                      });
                  }).catch(e => {
                    this.foundError(e, 'createFBUser');
                  });
                }).catch(e => {
                  this.foundError(e, 'createFBUser');
                });
            })
            .catch(e => { }); //No need to do anything.
        } else {
          this.helper.showAlert('Email or password is invalid.', 'Wrong credentials!');
        }
      }).catch(e => {
        this.foundError(e, 'createFBUser');
      });

  }

  resetPassword() {

  }

  public foundError(e, where) {
    console.log(where);
    console.log(e);
    this.helper.hideLoading();
    if (e) {
      if (e.code) {
        switch (e.code) {
          // where = signIn
          case 'auth/redirect-cancelled-by-user':
            // do nothing
            break;
          case 'auth/operation-not-supported-in-this-environment':
            this.helper.showAlert('An unknown error has occured', 'Access denied!');
            break;
          case 'auth/account-exists-with-different-credential':
            const pendingEmail = e.email;
            const pendingCred = e.credential;
            let linkModal = this.modalCtrl.create('AccountlinkPage', {
              user: null,
              cred: pendingCred,
              email: pendingEmail
            });
            linkModal.present();
            break;
          // **********signIn**********
          // where = verifyUser
          // ************verifyUser**************
          // where = attemptLogin
          case 'auth/invalid-email':
            this.helper.showAlert('Email Id is wrong.', 'Invalid!');
            break;
          case 'auth/user-disabled':
            this.helper.showAlert('Your access to Health Wizz is blocked for some reason.', 'Blocked!');
            break;
          case 'auth/user-not-found':
            this.createFBUser();
            break;
          case 'auth/wrong-password':
            this.helper.showAlert('The password you entered is incorrect.', 'Invalid!');
            break;
          // ***********attemptLogin**************
          // where = authenticateUser
          case 102:
          case 503:
            if (e.code == 102) {
              console.log('Password changed on firebase');
              this.loginProvider.checkEmail(this.user_cred.emailID)
                .then(r => {
                  if (r == false) {
                    this.restService.resetPassword(this.user_cred)
                      .subscribe(res => {
                        this.attemptLogin(true);
                        // if (res.status == 200) {
                        //   this.attemptLogin(true);
                        // } else {
                        //   this.helper.showAlert('Something went wrong with your sign-in. Please try again.', 'Unknown error!');
                        // }
                      }, err => {
                        this.helper.showAlert('Something went wrong with your login. Please try again.', 'Unknown error!');
                      });
                  } else {
                    this.helper.showAlert('Email or password not valid.', '');
                  }
                }).catch(err => {
                  this.helper.showAlert('Something went wrong with your login. Please try again.', 'Unknown error!');
                });
            }
            break;
          // ***********authenticateUser**********
          // where = createFBUser
          // *********createFBUser*********
          default:
            this.helper.showAlert('Something went wrong with your login. Please try again.', 'Unknown error!');
            break;
        }
      } else {
        this.helper.showAlert('Something went wrong with your login. Please try again.', 'Unknown error!');
      }
    }
  }
}
class Credentials {
  constructor(
    public token: string,
    public federatedLogin: boolean,
    public uid: string,
    public providerId: string
  ) { }
}