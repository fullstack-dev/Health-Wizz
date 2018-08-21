import { Component } from '@angular/core';
import { IonicPage, NavController, ModalController, NavParams } from 'ionic-angular';
import { Rest } from '../../../providers/rest';
import { Participant } from '../../../models/classes';
import { RestDataProvider } from '../../../providers/rest-data-service/rest-data-service';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { UserService } from '../../../providers/user-service';
import { Helper } from '../../../providers/helper-service';

@IonicPage()
@Component({
  selector: 'page-validate',
  templateUrl: 'validate.html',
})
export class ValidatePage {

  otherData: any;
  validData: any;
  errorMessage: string;
  campaign: any;
  participants: Array<Participant>;
  userId: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public restService: RestDataProvider,
    public domSanitizer: DomSanitizer,
    public userService: UserService,
    public rest: Rest,
    public helper: Helper
  ) {
    this.userId = userService.getUserId();
  }

  ionViewWillEnter() {
    this.campaign = this.navParams.get('campaign');
    this.getMembers();

  }

  getMembers() {
    this.helper.showLoading();
    this.loadParticipants()
      .then((participants: Array<Participant>) => {
        this.helper.hideLoading();
        this.participants = participants;
      }).catch(e => {
        console.warn(e);
        this.helper.hideLoading();
      });
  }

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
                  reject(e);
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
        }, err => {
          console.log(err);
          reject(err);
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
          // resolve("assets/imgs/HomeIcons/avatar_male_middle_01.png");
        });
    });
  }

  // getOtherData() {
  //   this.rest.getOtherData()
  //     .subscribe(
  //       data => {
  //         this.otherData = data;
  //         this.validData = this.otherData.manageData;
  //         console.log(this.validData);
  //       },
  //       error => {
  //         this.errorMessage = <any>error;
  //       });
  // }

  addValidate($event, member: Participant, index) {
    console.log(member);
    let partFeeModal = this.modalCtrl.create('ValidateReportPage', { 'campaign': this.campaign, 'member': member });
    partFeeModal.onDidDismiss(data => {
      console.log(data);
      if (data.value == 'done') {
        this.getMembers();
        // this.getMember(member.info.memberId)
        //   .then(_member => {
        //     member.info = _member;
        //     // refresh participants
        //     let participants = this.participants;
        //     participants[index] = member;
        //     this.participants = participants;
        //   }).catch(e => {
        //     this.getMembers();
        //   });
      } else {
        console.log('cancel');
      }
    });
    partFeeModal.present();

  }

  getMember(memberId) {
    return new Promise((resolve, reject) => {
      this.restService.getParticipantsById(this.campaign.campaignInfo.circleInfo.id, memberId)
        .subscribe((member: any) => {
          resolve(member);
        }, err => {
          console.log(err);
          reject(err);
        });
    });
  }

  cancel() {
    this.navCtrl.setRoot('CampaignPage');
  }
  done() {
    this.cancel();
  }

  submitted() {
    this.navCtrl.setRoot('SubmitReport3Page');
  }

}
