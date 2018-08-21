import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable()
export class Rest {

  private loginapiUrl = 'assets/data/users.json';
  private scoreapiUrl = 'assets/data/score.json';
  private healthindexapiUrl = 'assets/data/health_index.json';
  private cancerUrl = 'assets/data/cancers_en.json';
  private chfapiUrl = 'assets/data/chf.json';
  private physicianapiUrl = 'assets/data/physician.json';
  private addmedrecordsapiUrl = 'assets/data/add_med_records.json';
  private campaignUrl = 'assets/data/campaign.json';
  private availablecirclesUrl = 'assets/data/circles.json';
  private notificationUrl = 'assets/data/notification.json';
  private rewardsUrl = 'assets/data/reward.json';
  private inviteUrl = 'assets/data/invite.json';
  private shopUrl = 'assets/data/shop.json';
  private otherUrl = 'assets/data/other.json';
  private cdapiUrl = 'assets/data/chronic_diseases.json';
  private frequencyUrl = 'assets/data/frequency.json';
  private languageUrl = 'assets/data/languages.json';
  private healthIndexesUrl = 'assets/data/health_indexes_en.json';
  private specialityUrl = 'assets/data/speciality.json';
  private defaultmaleavtarUrl = 'assets/imgs/HomeIcons/avatar_male_middle_01.png';
  private defaultfemaleavtarUrl = 'assets/imgs/HomeIcons/avatar_female_middle_01.png';
  private templateUrl = 'assets/data/campaign_templates.json';
  private addressUrl = 'assets/data/address.json';

  constructor(public http: Http,
    public domSanitizer: DomSanitizer, ) { }

  getContries(): Observable<any> {
    return this.http.get(this.addressUrl)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getLanguages(): Observable<any> {
    return this.http.get(this.languageUrl)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getLangResource(langResUrl: string) {
    return this.http.get(langResUrl)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getUsers(): Observable<string[]> {
    return this.http.get(this.loginapiUrl)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getScores(): Observable<string[]> {
    return this.http.get(this.scoreapiUrl)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getHealthIndexes(): Observable<any> {
    return this.http.get(this.healthindexapiUrl)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getCancers(): Observable<any> {
    return this.http.get(this.cancerUrl)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getIndicators(): Observable<any> {
    return this.http.get(this.healthIndexesUrl)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getCHFs(): Observable<string[]> {
    return this.http.get(this.chfapiUrl)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getCDs(): Observable<any> {
    return this.http.get(this.cdapiUrl)
      .map(this.extractData)
      .catch(this.handleError);
  }

  // getZipCode(): Observable<string[]> {
  //   return this.http.get(this.geocodelink)
  //     .map(this.extractData)
  //     .catch(this.handleError);
  // }

  getPhysicians(): Observable<string[]> {
    return this.http.get(this.physicianapiUrl)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getAddMedRecords(): Observable<string[]> {
    return this.http.get(this.addmedrecordsapiUrl)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getCampaigns(): Observable<string[]> {
    return this.http.get(this.campaignUrl)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getTemplates(): Observable<any> {
    return this.http.get(this.templateUrl)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getFrequencies(): Observable<any> {
    return this.http.get(this.frequencyUrl)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getCircles(): Observable<string[]> {
    return this.http.get(this.availablecirclesUrl)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getNotification(): Observable<string[]> {
    return this.http.get(this.notificationUrl)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getRewards(): Observable<string[]> {
    return this.http.get(this.rewardsUrl)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getInviters(): Observable<string[]> {
    return this.http.get(this.inviteUrl)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getShopdata(): Observable<string[]> {
    return this.http.get(this.shopUrl)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getOtherData(): Observable<string[]> {
    return this.http.get(this.otherUrl)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getSpeciality(): Observable<any> {
    return this.http.get(this.specialityUrl)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getDefaultMaleAvtar(): Observable<any> {
    return this.http.get(this.defaultmaleavtarUrl).map((res: any) => {
      return res.url;
    })

  }

  getDefaultFemaleAvtar(): Observable<any> {
    return this.http.get(this.defaultfemaleavtarUrl).map((res: any) => {
      return res.url;
    })
  }

  authorizationCall(link): Observable<string[]> {
    let headers = new Headers();
    this.addDefaultHeaders(headers);
    return this.http.get(link, {
      headers: headers
    })
    .map(this.extractData)
    .catch(this.handleError);
  }

  private addDefaultHeaders(headers): Headers {
    headers.append('Accept', 'application/json+fhir');
    return headers;
  }

  getAccessToken(url, data) : Observable<string[]> {
    let headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded'});
    let options = new RequestOptions({headers: headers});
    return this.http.post(url, data, options)
    .map(this.extractData)
    .catch(this.handleError);
  }

  getPatientData(url, accessToken) : Observable<string[]> {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + accessToken
    });
    let options = new RequestOptions({headers: headers});
    return this.http.get(url, options)
    .map(this.extractData)
    .catch(this.handleError); 
  }

  getPatientCCDDocument(url, accessToken) : Observable<string[]> {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + accessToken
    });
    let options = new RequestOptions({headers: headers});
    return this.http.get(url, options)
    .map(this.extractData)
    .catch(this.handleError); 
  }

  getPatientCCDDetail(url) {
    let headers = new Headers({
    });
    let options = new RequestOptions({headers: headers});
    return this.http.get(url, options)
    .map(this.ccdExtractData)
    .catch(this.ccdHandleError);
  }

  private extractData(res: Response) {
    let body = res.json();
    return body || {};
  }

  private handleError(error: Response | any) {
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg);
  }

  private ccdExtractData(res: Response) {
    return res;
  }

  private ccdHandleError (error: Response | any) {
    return error;
  }

}