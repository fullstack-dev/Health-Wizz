import { Component } from '@angular/core';
import { IonicPage, NavController, PopoverController, NavParams } from 'ionic-angular';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';

import { Rest } from '../../../providers/rest';
import { Participant } from '../../../models/classes';
import { RestDataProvider } from '../../../providers/rest-data-service/rest-data-service';
import { Toast } from '@ionic-native/toast';
import { UserService } from '../../../providers/user-service';
import { LocalDataProvider } from '../../../providers/local-data/local-data';

@IonicPage()
@Component({
  selector: 'page-manage-roles',
  templateUrl: 'manage-roles.html',
})
export class ManageRolesPage {

  otherData: any;
  manageData: any;
  errorMessage: string;
  campaign: any;
  participants: Array<Participant>;
  userId: any;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public domSanitizer: DomSanitizer,
    public restService: RestDataProvider,
    public popoverCtrl: PopoverController,
    public userService: UserService,
    public rest: Rest,
    private toast: Toast,
    public local: LocalDataProvider
  ) {

  }

  ionViewDidLoad() {
    this.userId = this.userService.getUserId();
    this.campaign = this.navParams.get('campaign');
    this.getManageData();
  }

  getManageData() {
    this.loadParticipants()
      .then((participants: Array<Participant>) => {
        this.participants = participants;
        console.log(this.participants);
      });
  }

  // this.rest.getOtherData()
  //   .subscribe(
  //     data => {
  //       this.otherData = data;
  //       this.manageData = this.otherData.manageData;
  //       console.log(this.manageData);
  //     },
  //     error => {
  //       this.errorMessage = <any>error;
  //     });

  loadParticipants() {
    return new Promise((resolve, reject) => {
      let _participants = [];
      this.getParticipants(this.campaign.campaignInfo.circleInfo.id)
        .then((participants: Array<any>) => {
          participants.forEach((member, i, a) => {
            if (member.invitationState == 'accept') {
              this.getParticipantProfilePic(member)
                .then(avatar => {
                  _participants.push(new Participant(member, avatar));
                  if (i == a.length - 1) {
                    resolve(_participants);
                  }
                }).catch(e => {
                  reject();
                });
            }
            else if (i == a.length - 1) {
              resolve(_participants);
            }

          });
        });
    });
  }

  getParticipants(circleId: string) {
    return new Promise((resolve, reject) => {
      this.restService.getParticipants(circleId)
        .subscribe((result: any) => {
          resolve(result.info);
        }, err => {
          console.log(err);
          reject();
        });
    });
  }

  getParticipantProfilePic(member: any) {
    return new Promise((resolve) => {
      this.restService.getProfilePic(member.memberId)
        .subscribe(pic => {
          let imagePath: SafeResourceUrl;
          imagePath = this.domSanitizer.bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + pic.image);
          resolve(imagePath);
        }, err => {
          try {
            if (member.gender == "male") {
              resolve(new Participant(member, "assets/imgs/HomeIcons/avatar_male_middle_01.png"));
            } else {
              resolve(new Participant(member, "assets/imgs/HomeIcons/avatar_female_middle_01.png"));
            }
          } catch (e) { }
        });
    });
  }

  selectOptions(event, item, index) {
    let popover = this.popoverCtrl.create('PopoverManagePage', { 'member': item.info, 'creatorId': this.campaign.creatorId }, { cssClass: 'manage-role-popover', enableBackdropDismiss: true });
    popover.onDidDismiss((data) => {
      if (data) {
        switch (data.value) {
          case 1:
            this.makeModerator(item.info, index);
            break;
          case 2:
            this.makeValidator(item.info, index);
            break;
          case 3:
            this.removeFromModerator(item.info, index);
            break;
          case 4:
            this.removeFromValidator(item.info, index);
            break;
          case 5:
            this.deleteMember(item.info, index);
            break;
          default:
            break;
        }
      }
    });
    popover.present({
      ev: event
    });
  }

  makeModerator(member, index) {

    member.memberRoles.moderator = true;
    this.restService.updateMembership(member, this.campaign.campaignInfo.circleInfo.id)
      .subscribe(r => {
        member.memberRoles.moderator = true;
        // this.participants[index].info.memberRoles.moderator = true;
      }, err => {
        console.log(err);
        member.memberRoles.moderator = false;
        this.toast.showShortBottom("Can't make moderator!").subscribe(r => { });
      });
  }

  makeValidator(member, index) {

    member.memberRoles.validator = true;
    this.restService.updateMembership(member, this.campaign.campaignInfo.circleInfo.id)
      .subscribe(r => {
        member.memberRoles.validator = true;
        this.updateMyMemberShip(member, true);
        // this.participants[index].info.memberRoles.validator = true;
      }, err => {
        console.log(err);
        member.memberRoles.validator = false;
        this.toast.showShortBottom("Can't make validator!").subscribe(r => { });
      });
  }

  removeFromModerator(member, index) {
    member.memberRoles.moderator = false;
    this.restService.updateMembership(member, this.campaign.campaignInfo.circleInfo.id)
      .subscribe(r => {
        // this.participants[index].info.memberRoles.moderator = false;
        member.memberRoles.moderator = false;
      }, err => {
        console.log(err);
        member.memberRoles.moderator = true;
        this.toast.showShortBottom("Can't remove moderator!").subscribe(r => { });
      });
  }

  removeFromValidator(member, index) {

    member.memberRoles.validator = false;
    this.restService.updateMembership(member, this.campaign.campaignInfo.circleInfo.id)
      .subscribe(r => {
        member.memberRoles.validator = false;
        this.updateMyMemberShip(member, false);
        // this.participants[index].info.memberRoles.validator = false;
      }, err => {
        console.log(err);
        member.memberRoles.validator = true;
        this.toast.showShortBottom("Can't remove validator!").subscribe(r => { });
      });
  }

  updateMyMemberShip(member, validator: boolean) {
    this.userId = this.userService.getUserId();
    this.campaign = this.navParams.get('campaign');
    if (this.userId == member.memberId) {
      this.campaign.validator = validator;
      this.local.updateLocalCampaigns(this.campaign);
    }
  }

  deleteMember(member, index) {
    this.restService.deleteMember(this.campaign.campaignInfo.circleInfo.id, member.memberId)
      .subscribe(r => {
        this.participants.splice(index, 1);
      }, e => {
        this.toast.showShortBottom("Can't delete member!").subscribe(r => { });
      });
  }

  back() {
    this.navCtrl.setRoot('CampaignPage');
  }

  done() {
    // this.navCtrl.push('CampaignPage');
    this.navCtrl.pop();
  }
}
