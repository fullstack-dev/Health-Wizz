import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Participant, MemberRolesInfo, InviteScreenInfo, Invities } from '../../../models/classes';
import { Helper } from '../../../providers/helper-service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RestDataProvider } from '../../../providers/rest-data-service/rest-data-service';
import { UserService } from '../../../providers/user-service';

@IonicPage()
@Component({
  selector: 'page-campaign-participants',
  templateUrl: 'campaign-participants.html',
})
export class CampaignParticipantsPage {
  campaign: any;
  participants: Array<Participant>;
  ended: boolean;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private helper: Helper,
    public domSanitizer: DomSanitizer,
    public restService: RestDataProvider,
    public userService: UserService
  ) {
  }

  ionViewDidEnter() {
    // console.log('ionViewDidLoad CampaignParticipantsPage');
    this.campaign = this.navParams.get('campaign');
    this.ended = this.navParams.get('ended');
    this.helper.showLoading();
    this.loadParticipants()
      .then((participantsList: Array<any>) => {
        this.helper.hideLoading();
        this.participants = participantsList.sort(this.sortParticipants);
      }).catch(e => {
        this.helper.hideLoading();
      });
  }

  sortParticipants(a: Participant, b: Participant) {
    if (a.info.firstName && b.info.firstName) {
      if (a.info.firstName.toLowerCase() > b.info.firstName.toLowerCase()) {
        return 1;
      }
      if (a.info.firstName.toLowerCase() < b.info.firstName.toLowerCase()) {
        return -1;
      }
      if (a.info.firstName.toLowerCase() == b.info.firstName.toLowerCase()) {
        return 0;
      }
    } else {
      return -1;
    }
  }

  loadParticipants() {
    // console.log(this.campaign);
    return new Promise((resolve, reject) => {
      let _participants = [];
      this.getParticipants(this.campaign.campaignInfo.circleInfo.id)
        .then((participants: Array<any>) => {
          participants.forEach((member, i, a) => {
            // if (member.memberId != this.campaign.creatorId) {
            this.getParticipantProfilePic(member)
              .then(avatar => {
                _participants.push(new Participant(member, avatar));
                if (i == a.length - 1) {
                  resolve(_participants);
                }
              });
            // } else if (i == a.length - 1) {
            //   resolve(_participants);
            // }

          });
        }).catch(e => {
          reject(e);
        });
    });
  }

  getParticipants(circleId: string) {
    return new Promise((resolve, reject) => {
      this.restService.getParticipants(circleId)
        .subscribe((result: any) => {
          resolve(result.info);
        }, e => {
          reject(e);
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
        }, e => {
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

  isAdmin(member) {
    if (this.campaign && member.info.invitationState == 'accept') {
      if (this.campaign.creatorId == member.info.memberId) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  openInvitePeople() {
    let memberRoles: MemberRolesInfo = new MemberRolesInfo(false, false, true);
    let screen_info: InviteScreenInfo = new InviteScreenInfo('challenge', this.campaign.id, memberRoles, 'send', new Invities([], []), this.campaign.campaignInfo.isPublish);
    this.navCtrl.push('InvitePeoplePage', { 'invite_screen_info': screen_info });
  }

}
