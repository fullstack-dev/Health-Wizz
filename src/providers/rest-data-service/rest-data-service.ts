
import { Injectable } from '@angular/core';
import { HttpService } from '../http-service';
import { UserService } from '../user-service';
import { CircleLeaveData, CampaignData, CircleAcceptDeny, UserSettings, WalletInfo, LedgerInfo } from '../../models/classes';

@Injectable()
export class RestDataProvider {
  private challenge_url: string = 'challenges/';
  private campaign_url: string = '/campaign';
  private templateUrl: string = 'template';
  private circleUrl: string = 'circles/';
  // private createCircleUrl: string = 'circles';
  private mhiStatusUrl: string = 'getMHIStatus/'; // --> getMHIStatus/{userId}
  private mhiReportUrl: string = 'getMHIReport/'; //--> getMHIReport/{userId}?fromDate=yyyy-MM-dd&toDate=yyyy-MM-dd
  private saveMhiUrl: string = 'saveUserMhi'
  private participantsUrl: string = '/members/';
  private profilePicUrl: string = 'memberProfilePic/';
  private purseUrl: string = 'purse/';
  private ledgerUrl: string = 'purse/ledger/';
  private tokenUrl: string = 'fcm';
  private profileUrl: string = 'updateProfile';
  private userProfileUrl: string = 'userProfile/'; // --> 'userProfile/{userId}'
  private resetPasswordUrl: string = 'resetFirebasePassword';
  // private updateLedgerUrl: string = "purse/ledger";
  private membersSuffix: string = '/members'; // --> circles/{circleId}/members
  private geocodelinkUrl = "geoCode/"; // --> geocode/this.zipcode
  private findPhyscianUrl = "findPhyscian";// --> find physician list
  private connectedDeviceUrl = "getConnectedDevices/" // --> /{userId}
  private deviceConnectUrl = "getKiotUrl/" // --> userId/fitbit/CONNECT or /DISCONNECT
  private createSurveyUrl = "/survey?submitReport=false"; // --> challenges/{id}/URL
  private rewardsUrl = "/rewards/";
  private SurveyUrl = "/survey"; // --> challenges/{id}/URL
  private updateSurveyUrl = "/survey?submitReport=true"; // --> challenges/{id}/URL
  private validateIndexUrl = "/indicators";
  private campaignSettingsUrl = "/settings";
  private personalSettingsUrl = "personalSettings";
  private otpUrl = "invitePhone";
  private gasFucetUrl = "https://faucet.ethereum.healthwizz.io/gas?address=";
  private OMPFucetUrl = "https://faucet.ethereum.healthwizz.io/omp?address=";
  constructor(
    public httpService: HttpService,
    public userService: UserService
  ) {

  }

  public giveInitialGas(address: string) {
    return this.httpService.postGAS(this.gasFucetUrl + address);
  }

  public giveInitialOMP(address: string) {
    return this.httpService.postOMP(this.OMPFucetUrl + address);
  }

  public otpPost(otp) {
    return this.httpService.post(this.getUrl(this.otpUrl), otp);
  }

  public getTemplates() {
    return this.httpService.get(this.getUrl(this.templateUrl));
  }

  public getCampaigns() {
    return this.httpService.get(this.getUrl(this.challenge_url));
  }

  public getCampaign(campaign_id) {
    return this.httpService.get(this.getUrl(this.challenge_url + campaign_id));
  }

  public createCampaign(data: CampaignData) {
    return this.httpService.post(this.getUrl(this.challenge_url), data);
  }

  public updateCampaign(campaign, id) {
    return this.httpService.post(this.getUrl(this.challenge_url + id), campaign);
  }

  public deleteCampaign(campaignId) {
    return this.httpService.delete(this.getUrl(this.challenge_url + campaignId));
  }

  /**
   * publish a campaign
   * @param campaign 
   * @param campaignId 
   * @return Subscription
   */
  public publishCampaign(campaign, campaignId) {
    return this.httpService.post(this.getUrl(this.challenge_url + campaignId + this.campaign_url), campaign);
  }

  public getPersonalSettings() {
    return this.httpService.get(this.getUrl(this.personalSettingsUrl));
  }

  public savePersonalSettings(settings: UserSettings) {
    return this.httpService.post(this.getUrl(this.personalSettingsUrl), settings);
  }

  public getCampaignSettings(campaignId) {
    return this.httpService.get(this.getUrl(this.challenge_url + campaignId + this.campaignSettingsUrl));
  }

  public saveCampaignSettings(campaignId, settings) {
    return this.httpService.post(this.getUrl(this.challenge_url + campaignId + this.campaignSettingsUrl), settings);
  }

  public createSurvey(campaignId: string, survey_data: any) {
    return this.httpService.post(this.getUrl(this.challenge_url + campaignId + this.createSurveyUrl), survey_data);
  }

  public updateCampaignSurvey(campaignId: string, survey_data: any) {
    return this.httpService.post(this.getUrl(this.challenge_url + campaignId + this.createSurveyUrl), survey_data);
  }

  public getSurvey(campaignId: string) {
    return this.httpService.get(this.getUrl(this.challenge_url + campaignId + this.SurveyUrl));
  }

  public updateSurvey(campaignId: string, survey_data: any) {
    return this.httpService.post(this.getUrl(this.challenge_url + campaignId + this.updateSurveyUrl), survey_data)
  }

  /**
   * GET:  users/{userId}/challenges/{challengeId}/rewards
   * @param campaignId 
   */
  public getRewards(campaignId) {
    return this.httpService.get(this.getUrl(this.challenge_url + campaignId + this.rewardsUrl));
  }

  public createReward(campaignId: string, rewards_data: any) {
    return this.httpService.post(this.getUrl(this.challenge_url + campaignId + this.rewardsUrl), rewards_data)
  }

  public updateReward(campaignId: string, rewards_data: any) {
    let rewardsId = rewards_data.id;
    return this.httpService.post(this.getUrl(this.challenge_url + campaignId + this.rewardsUrl + rewardsId), rewards_data)
  }

  public deleteRewards(campaignId: string, rewardsId: any) {
    return this.httpService.delete(this.getUrl(this.challenge_url + campaignId + this.rewardsUrl + rewardsId));

  }

  public updateUserPurse(data: WalletInfo) {
    return this.httpService.put(this.getUrl(this.purseUrl), data);
  }

  public updateCampaignPurse(campaignId, data: WalletInfo) {
    return this.httpService.put(this.getUrl(this.challenge_url + campaignId + this.campaign_url + "/" + this.purseUrl), data);
  }

  /**
   *  GET: users/{userId}/challenges/{challengeId}/survey/members/{memberId}?validate=true
   * @param campaignId
   * @param memberId
   **/
  public getMemberSurvey(campaignId: string, memberId: string) {
    return this.httpService.get(this.getUrl(this.challenge_url + campaignId + this.SurveyUrl + this.participantsUrl + memberId + "?validate=true"))
  }

  public getRewardsMemberSurvey(campaignId: string, memberId: string) {
    return this.httpService.get(this.getUrl(this.challenge_url + campaignId + this.SurveyUrl + this.participantsUrl + memberId + "?report=true"))
  }

  // POST: users/{userId}/challenges/{challengeId}/survey/members/{memberId}
  public validateMemberSurvey(campaignId: string, memberId: string, data: any) {
    return this.httpService.post(this.getUrl(this.challenge_url + campaignId + this.SurveyUrl + this.participantsUrl + memberId), data);
  }

  // GET: users/{userId}/challenges/{challengeId}/indicators/members/{memberId}?validate=true
  public getMemberIndexes(campaignId: string, memberId: string) {
    return this.httpService.get(this.getUrl(this.challenge_url + campaignId + this.validateIndexUrl + this.participantsUrl + memberId + "?validate=true"));
  }

  public getRewardMemberIndexes(campaignId: string, memberId: string) {
    return this.httpService.get(this.getUrl(this.challenge_url + campaignId + this.validateIndexUrl + this.participantsUrl + memberId + "?report=true"));
  }

  // POST: users/{userId}/challenges/{challengeId}/indicators/members/{memberId}
  public validateMemberIndexes(campaignId: string, memberId: string, data: any) {
    return this.httpService.post(this.getUrl(this.challenge_url + campaignId + this.validateIndexUrl + this.participantsUrl + memberId), data);
  }

  // public acceptDenyCampaign(challengeId: string, state: string) {
  public acceptDenyCampaign(campaign) {
    // let data = new CampaignAcceptDeny(challengeId, false, false, true, { circleInfo: { invitationState: state } });
    return this.httpService.post(this.getUrl(this.challenge_url.concat(campaign.id)), campaign);
  }

  public getCircles() {
    return this.httpService.get(this.getUrl(this.circleUrl));
  }

  public getCircle(circleId) {
    return this.httpService.get(this.getUrl(this.circleUrl + circleId));
  }

  public leaveCircle(circleId) {
    let data = new CircleLeaveData(circleId, "left");
    return this.httpService.post(this.getUrl(this.circleUrl + circleId), data);
  }

  public accpetDenyCircle(circleId, state) {
    let data = new CircleAcceptDeny(circleId, state);
    return this.httpService.post(this.getUrl(this.circleUrl + circleId), data);
  }

  public deleteCircle(circleId) {
    return this.httpService.delete(this.getUrl(this.circleUrl + circleId));
  }

  public deleteMember(circleId, memberId) {
    return this.httpService.delete(this.getUrl(this.circleUrl + circleId + this.membersSuffix + '/' + memberId));
  }

  public inviteInCircle(circleId, data) {
    return this.httpService.post(this.getUrl(this.circleUrl + circleId + this.membersSuffix), data);
  }

  public inviteMember(item_id, item_type, data) {
    return this.httpService.post(this.getUrl(item_type + 's/' + item_id + this.membersSuffix), data);
  }

  public createCircle(data) {
    return this.httpService.post(this.getUrl(this.circleUrl), data);
  }

  public updateCircle(data, circleId) {
    return this.httpService.post(this.getUrl(this.circleUrl + circleId), data);
  }

  public getParticipants(circleID: string) {
    return this.httpService.get(this.getUrl(this.circleUrl + circleID + this.participantsUrl));
  }

  public getParticipantsById(circleID: string, memberId) {
    return this.httpService.get(this.getUrl(this.circleUrl + circleID + this.participantsUrl + memberId));
  }

  public updateMembership(member, circleID) {
    return this.httpService.post(this.getUrl(this.circleUrl + circleID + this.participantsUrl + member.memberId), member);
  }

  public getProfilePic(memberID: string) {
    return this.httpService.get(this.profilePicUrl.concat(memberID));
  }

  public getProfile() {
    return this.httpService.get(this.userProfileUrl.concat(this.userService.getUserId()));
  }

  public getMemberProfile(memberId) {
    return this.httpService.get(this.userProfileUrl.concat(memberId));
  }

  public getMhiStatus() {
    return this.httpService.get(this.mhiStatusUrl.concat(this.userService.getUserId()));
  }

  public getMemberMhiStatus(memberId) {
    return this.httpService.get(this.mhiStatusUrl.concat(memberId));
  }

  public getMhiReport(fromDate, toDate) {
    return this.httpService.get(this.mhiReportUrl + this.userService.getUserId() + '?fromDate=' + fromDate + '&toDate=' + toDate);
  }

  public saveMhi(data) {
    return this.httpService.post(this.saveMhiUrl, data);
  }

  public registerToken(token) {
    return this.httpService.post(this.getUrl(this.tokenUrl), token);
  }

  public resetPassword(credentials: any) {
    return this.httpService.post(this.resetPasswordUrl, credentials);
  }

  public getPurse() {
    return this.httpService.get(this.getUrl(this.purseUrl));
  }

  // /users/{userId}/circles/{circleId}/members/{memberId}/purse
  public getMemberPurse(circleId, memberId) {
    return this.httpService.get(this.getUrl(this.circleUrl + circleId + this.membersSuffix + "/" + memberId + "/" + this.purseUrl));
  }

  public getLedger() {
    return this.httpService.get(this.getUrl(this.ledgerUrl));
  }

  public updateLedger(data) {
    return this.httpService.post(this.getUrl(this.ledgerUrl + "?code=" + data), "");
  }

  public updateUserLedger(data: LedgerInfo) {
    return this.httpService.post(this.getUrl(this.ledgerUrl), data);
  }

  public updateCampaignLedger(campaignId: string | number, data: LedgerInfo) {
    return this.httpService.post(this.getUrl(this.challenge_url + campaignId + this.campaign_url + "/" + this.ledgerUrl), data);
  }

  public updateProfile(data) {
    return this.httpService.put(this.profileUrl, data);
  }

  /**
   * append users/{userId}/ in the given url
   * @param url 
   * @returns "users/{userId}/url"
   */
  private getUrl(url: string): string {
    return 'users/' + this.userService.getUserId() + '/' + url;
  }

  public getZipCode(data) {
    return this.httpService.get(this.geocodelinkUrl + data);
  }

  public getConnectedDevices() {
    return this.httpService.get(this.connectedDeviceUrl + this.userService.getUserId());
  }

  public connectToFitbit(action: string, deviceName: string) {
    return this.httpService.get(this.deviceConnectUrl + this.userService.getUserId() + '/' + deviceName + '/' + action);
  }
  public disconnectToFitbit(url: string) {
    return this.httpService.deviceDelete(url);
  }
  public findPhyscian(data) {
    return this.httpService.post(this.findPhyscianUrl, data);
  }

}
