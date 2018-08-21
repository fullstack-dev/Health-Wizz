import { Component } from '@angular/core';
import { IonicPage, Platform, NavController, NavParams, LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser';

import { Rest } from '../../../providers/rest';

/**
 * Generated class for the SandboxListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-sandbox-list',
  templateUrl: 'sandbox-list.html',
})
export class SandboxListPage {

  loader: any = null;
  inAppBrowserRef: any;

  authResult: any;
  authResultEpic: any;
  accTokenResult: any;
  accTokenResultEpic: any;

  constructor(
    public platform: Platform,
  	public navCtrl: NavController, 
  	public navParams: NavParams,
    private storage: Storage,
    public rest: Rest,
    private iab: InAppBrowser,
    private loadingCtrl: LoadingController) {
  }

  ionViewDidLoad() {

  }

  before() {
    this.navCtrl.setRoot('AddMedRecordsPage');
  }

  goToCerner() {
    this.cernerOAuth2Login();
  }

  goToEpic() {
    this.epicOAuth2Login();
  }

  cernerOAuth2Login() {
    let scope = "launch/patient,online_access,patient/Binary.read,patient/Patient.read,patient/DocumentReference.read";
    
    let serviceUri = "https://fhir-myrecord.sandboxcerner.com/dstu2/0b8a0111-e8e6-4c26-a91c-5069cbc6b1ca/";

    this.storage.set('serviceUri', serviceUri);

    let redirectUri = "http://localhost:8100/";

    let clientIdCerner = "46185eb0-8569-455e-a0de-c6672ef3385a";

    let link = serviceUri + "metadata";

    let loadingCtrlOptions = {
      content: "waiting..."
    };
    this.loader = this.loadingCtrl.create(loadingCtrlOptions);
    this.loader.present();

    this.rest.authorizationCall(link)
    .subscribe(
      result => {
        this.authResult = result;

        let tokenUrl = this.authResult.rest[0].security.extension[0].extension[0].valueUri;
        
        this.storage.set('token_url', serviceUri);

        let authorizationUrl: any = this.authResult.rest[0].security.extension[0].extension[1].valueUri;

        let authenticateUrl = authorizationUrl + "?" + "response_type=code&" + "client_id=" + encodeURIComponent(clientIdCerner) + "&" +
              "scope=" + encodeURIComponent(scope) + "&" + "aud=" + encodeURIComponent(serviceUri) + "&" +
              "redirect_uri=" + encodeURIComponent(redirectUri);

        if(this.loader){ this.loader.dismiss(); this.loader = null; }

        // joe_smart/Cerner01
        // timmy_smart/Cerner01
        // wilma_smart/Cerner01
        // fredrick_smart/Cerner01

        const options: InAppBrowserOptions = {
          zoom: 'yes',
          location: 'no',
          toolbar: 'yes',
          mediaPlaybackRequiresUserAction: 'yes',
          allowInlineMediaPlayback: 'yes'
        }
        
        this.platform.ready().then(() => {
          // Opening a URL and returning an InAppBrowserObject
          const browser = this.iab.create(authenticateUrl, '_blank', options);
          browser.on('loadstart').subscribe(event => {
            let eventUrl = event.url;
            if(eventUrl.startsWith(redirectUri)) {
              let requestToken = (event.url).split("code=")[1]; //authorization code

              let loadingCtrlOptions = {
                content: "waiting..."
              };
              this.loader = this.loadingCtrl.create(loadingCtrlOptions);
              this.loader.present();

              let data = "client_id=" + clientIdCerner + "&redirect_uri=" + redirectUri + "&grant_type=authorization_code" + "&code=" + requestToken;
              
              this.rest.getAccessToken(tokenUrl, data)
              .subscribe(
                result => {
                  this.accTokenResult = result;

                  let accessToken = this.accTokenResult.access_token;
                  let refreshToken = this.accTokenResult.refresh_token;
                  let patientId = this.accTokenResult.patient;
                  let expiresIn = this.accTokenResult.expires_in;
                  let tokenType = this.accTokenResult.toekn_type;

                  this.storage.set('accessToken', accessToken);
                  this.storage.set('refreshToken', refreshToken);
                  this.storage.set('patientId', patientId);
                  this.storage.set('expiresIn', expiresIn);

                  if(this.loader){ this.loader.dismiss(); this.loader = null; }

                  browser.close();

                  this.navCtrl.setRoot('CernerPatientDataPage', { patientId: patientId, serviceUri: serviceUri, accessToken: accessToken});
                },
                error =>  {
                  let err = <any>error;
                  console.log(err);
                  if(this.loader){ this.loader.dismiss(); this.loader = null; }
                });
            }
            
          });
        }, err => {
          if(this.loader){ this.loader.dismiss(); this.loader = null; }
        });
      });     
  }

  epicOAuth2Login() {
    let scopeEpic = "launch/patient,patient/Observation.read,openid";
    
    let serviceUriEpic = "https://open-ic.epic.com/FHIR/api/FHIR/DSTU2/";

    let redirectUriEpic = "http://localhost:8100/";

    // let clientIdEpic = "cee5a068-b429-4e90-a6a4-7060cfce31e1";
    let clientIdEpic = "6c12dff4-24e7-4475-a742-b08972c4ea27";

    let linkEpic = "https://open-ic.epic.com/Argonaut/api/FHIR/Argonaut/metadata";

    let loadingCtrlOptions = {
      content: "waiting..."
    };
    this.loader = this.loadingCtrl.create(loadingCtrlOptions);
    this.loader.present();

    this.rest.authorizationCall(linkEpic)
    .subscribe(
      result => {
        this.authResultEpic = result;

        let tokenUrlEpic = this.authResultEpic.rest[0].security.extension[0].extension[1].valueUri;

        let authorizationUrlEpic: any = this.authResultEpic.rest[0].security.extension[0].extension[0].valueUri;

        let authenticateUrlEpic = authorizationUrlEpic + "?response_type=code&client_id=" + clientIdEpic + "&scope=" + scopeEpic + "&aud=" + serviceUriEpic + "&redirect_uri=" + redirectUriEpic;

        if(this.loader){ this.loader.dismiss(); this.loader = null; }

        // fhirjessica/epicepic1
        // fhirjason/epicepic1

        const options: InAppBrowserOptions = {
          zoom: 'yes',
          location: 'no',
          toolbar: 'yes',
          mediaPlaybackRequiresUserAction: 'yes',
          allowInlineMediaPlayback: 'yes'
        }
        
        this.platform.ready().then(() => {
          // Opening a URL and returning an InAppBrowserObject
          const browser = this.iab.create(authenticateUrlEpic, '_blank', options);
          browser.on('loadstart').subscribe(event => {
            let eventUrlEpic = event.url;
            if(eventUrlEpic.startsWith(redirectUriEpic)) {
              let requestTokenEpic = (event.url).split("code=")[1]; //authorization code

              let loadingCtrlOptions = {
                content: "waiting..."
              };
              this.loader = this.loadingCtrl.create(loadingCtrlOptions);
              this.loader.present();

              let data = "client_id=" + clientIdEpic + "&redirect_uri=" + redirectUriEpic + "&grant_type=authorization_code" + "&code=" + requestTokenEpic;
              this.rest.getAccessToken(tokenUrlEpic, data)
              .subscribe(
                result => {
                  this.accTokenResultEpic = result;

                  let accessTokenEpic = this.accTokenResultEpic.access_token;
                  let patientIdEpic = this.accTokenResultEpic.patient;
                  let expiresInEpic = this.accTokenResultEpic.expires_in;
                  let tokenTypeEpic = this.accTokenResultEpic.toekn_type;

                  this.storage.set('accessTokenEpic', accessTokenEpic);
                  this.storage.set('patientIdEpic', patientIdEpic);
                  this.storage.set('expiresInEpic', expiresInEpic);

                  if(this.loader){ this.loader.dismiss(); this.loader = null; }

                  browser.close();

                  this.navCtrl.setRoot('EpicPatientDataPage', { patientId: patientIdEpic, serviceUri: serviceUriEpic, accessToken: accessTokenEpic});
                },
                error =>  {
                  let err = <any>error;
                  console.log(err);
                  if(this.loader){ this.loader.dismiss(); this.loader = null; }
                });
            }
            
          });
        }, err => {
          if(this.loader){ this.loader.dismiss(); this.loader = null; }
        });
      });
  }
}
