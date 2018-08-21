import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UserService } from '../../../providers/user-service';
import { RestDataProvider } from '../../../providers/rest-data-service/rest-data-service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Helper } from '../../../providers/helper-service';
import { Participant } from '../../../models/classes';

@IonicPage()
@Component({
  selector: 'page-reward',
  templateUrl: 'reward.html',
})
export class RewardPage {
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
            if (member.invitationState == 'accept') {
              this.getParticipantProfilePic(member)
                .then(avatar => {
                  _participants.push(new Participant(member, avatar));
                  if (i == a.length - 1) {
                    resolve(_participants);
                  }
                });
            } else if (i == a.length - 1) {
              resolve(_participants);
            }

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
          // resolve("assets/imgs/HomeIcons/avatar_male_middle_01.png");
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

  // otherData: any;
  // rewardData: any;
  // errorMessage: any;

  // choice: any;

  // constructor(
  // 	public navCtrl: NavController, 
  // 	public navParams: NavParams,
  // 	public viewCtrl: ViewController,
  //   public rest: Rest,
  // 	) {

  //   let choice = this.navParams.get('choice');
  //   choice ? this.choice = choice : this.choice = 0;
  //   console.log('choice', this.choice);
  // }

  // ionViewDidLoad() {
  //   console.log('ionViewDidLoad RewardPage');
  //   this.getRewardsData();
  // }

  // getRewardsData() {
  //   this.rest.getOtherData()
  //     .subscribe(
  //       data => {
  //         this.otherData = data;
  //         this.rewardData = this.otherData.rewards;
  //         console.log(this.rewardData);                    
  //       },
  //       error =>  {
  //         this.errorMessage = <any>error;
  //       });
  //   }

  // resultDetails(item){
  //   console.log(item, this.choice);
  //     this.navCtrl.setRoot('ResultDetailsPage', { choice: this.choice});
  // }

  reward(memberInfo) {
    // this.navCtrl.setRoot('RewardMedicalPage', { 'campaign': this.campaign });
    this.navCtrl.push('RewardMedicalPage', { 'campaign': this.campaign, 'memberInfo': memberInfo });
  }
  goToResultDetails(memberId) {
    this.navCtrl.push('ResultDetailsPage', { 'campaign': this.campaign, 'memberId': memberId });

  }
  cancel() {
    this.navCtrl.setRoot('CampaignPage');
  }

  done() {
    this.cancel();
  }

}
