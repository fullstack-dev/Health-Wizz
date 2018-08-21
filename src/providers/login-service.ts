import { Injectable } from '@angular/core';
import { HttpService } from './http-service';
import * as firebase from 'firebase/app';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { User } from 'firebase/app';
@Injectable()

export class LoginService {

  public fb_user: User;
  public fb_user_info: any = null;
  public fb_credential: any = null;
  private baseUrl = '${}/sessions';

  constructor(
    private http: HttpService,
    private afAuth: AngularFireAuth,
    private afDB: AngularFireDatabase
  ) {
    afAuth.authState.subscribe(user => {
      if (!user) {
        // signed out user
        this.fb_user = null;
        this.fb_credential = null;
        this.fb_user_info = null;
        return;
      }
      // logged in user
      this.fb_user = user;
    });
  }

  login(opts) {
    return this.http.post(this.baseUrl, opts).map(res => res.json());
  }

  public getGoogleProvider() {
    let googleProvider = new firebase.auth.GoogleAuthProvider();
    // googleProvider.addScope('profile');
    googleProvider.addScope('profile');
    googleProvider.addScope('https://www.googleapis.com/auth/user.birthday.read');
    googleProvider.addScope('https://www.googleapis.com/auth/plus.login');
    googleProvider.addScope('https://www.googleapis.com/auth/plus.me');
    googleProvider.setCustomParameters({
      'prompt': 'select_account'
    });
    return googleProvider;
  }
  public getFacebookProvider() {
    let facebookProvider = new firebase.auth.FacebookAuthProvider();
    facebookProvider.addScope('user_birthday');
    facebookProvider.addScope('email');
    // facebookProvider.setCustomParameters({
    //   'auth_type': 'reauthenticate'
    // });
    return facebookProvider;
  }
  public getTwitterProvider() {
    let twitterProvider = new firebase.auth.TwitterAuthProvider();
    // twitterProvider.setCustomParameters({
    //   'force_login': true
    // });
    return twitterProvider;
  }

  public verifyUser(user: User) {
    const promise = new Promise((resolve, reject) => {
      this.afDB.database.ref('/users/' + user.uid).once('value').then(snapshot => {
        if (snapshot.val() !== null) {
          if (user.emailVerified === true) {
            resolve('VERIFIED');
          } else {
            // verification sent but not verified.
            resolve('UNVERIFIED');
          }
        } else {
          resolve('NEW');
        }
      }).catch(e => {
        resolve('Error');
      });
    });
    return promise;
  }

  public createUserWithPassword(email, password) {
    return this.afAuth.auth.createUserWithEmailAndPassword(email, password);
  }

  public checkEmail(email) {
    const promise = new Promise((resolve, reject) => {
      const link = 'checkEmail?emailId=' + email;
      this.http.common(link)
        .subscribe(result => {
          resolve(result.data);
        }, error => {
          reject(error);
        });
    });
    return promise;
  }

  public saveUser(user: User) {
    return this.afDB.database.ref('users/' + user.uid).set({
      uid: user.uid,
      email: user.email,
      verificationSent: true
    });
  }

  public deleteUser(user: User) {
    return user.delete();
  }

  public signInWithRedirect(provider) {
    return new Promise((resolve, reject) => {
      this.afAuth.auth
        .signInWithRedirect(provider)
        .then(() => {
          this.afAuth.auth
            .getRedirectResult()
            .then((result) => {
              // TODO: save user credentials for future use.
              this.fb_credential = result.credential;
              this.fb_user_info = result.additionalUserInfo;
              resolve(result);
            }).catch(e => {
              reject(e);
            });
        })
        .catch(e => {
          reject(e);
        });
    });
    // return promise;
  }

  public signInWithPassword(email, password) {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password);

  }

  public fetchProviders(email) {
    return this.afAuth.auth.fetchProvidersForEmail(email);
  }

  public linkUserWithCredential() {

  }

  public linkUserWithRedirect(provider) {

  }

  public sendVerificationMail(user: User) {
    return user.sendEmailVerification();
  }

  public getIdToken(user: User) {
    return user.getIdToken(false);
  }

  public getCurrentUser() {
    return this.fb_user;
  }

  public getCredential() {
    const promise = new Promise((resolve, reject) => {
      if (this.fb_credential !== null) {
        resolve(this.fb_credential);
      }
      reject(false);
    });
    return promise;
  }
  public getUserInfo() {
    const promise = new Promise((resolve, reject) => {
      if (this.fb_user_info !== null) {
        resolve(this.fb_user_info);
      }
      reject(false);
    });
    return promise;
  }
}