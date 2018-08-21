import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { RestDataProvider } from '../../providers/rest-data-service/rest-data-service';
import { Helper } from '../../providers/helper-service';
import { InviteCodeResponse } from '../../models/classes';
import { ConstProvider } from '../../providers/const/const';
import { LocalDataProvider } from '../../providers/local-data/local-data';

@IonicPage()
@Component({
  selector: 'page-otp',
  templateUrl: 'otp.html',
})
export class OtpPage {
  OTP: any;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private rest: RestDataProvider,
    private helper: Helper,
    private constant: ConstProvider,
    private local: LocalDataProvider
  ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad OtpPage');
  }
  public Before = () => {
    this.navCtrl.setRoot('HomePage');
  }
  public Done() {
    this.navCtrl.setRoot('HomePage');
  }

  otpSubmit() {
    this.rest.otpPost(this.OTP).
      subscribe((res: InviteCodeResponse) => {
        // console.log(res);
        // if (res == true) {
        //   this.helper.showAlert("Invitation code has been verified", 'Success');
        // } else {
        //   this.helper.showAlert("Invitation code is not valid", 'Error');
        // }
        if (res) {
          if (res.refChallenge) {
            this.helper.showConfirm("Code accepted!", "Your invitation code for joining a Campaign is accepted. Now you can join that Campaign in Campaigns page.", "Go", "Cancel")
              .then(r => {
                this.goToInvite(this.constant.INVITE_TYPE.CAMPAIGN);
              }).catch(e => { });
          } else if (res.refCircle) {
            this.helper.showConfirm("Code accepted!", "Your invitation code for joining a Cirle is accepted. Now you can join that Circle in Circles page.", "Go", "Cancel")
              .then(r => {
                this.goToInvite(this.constant.INVITE_TYPE.CIRCLE);
              }).catch(e => { });
          } else {
            this.helper.showAlert("Invitation code has been verified", 'Success!');
          }
        } else {
          this.helper.showAlert("Invitation code has been verified", 'Success!');
        }
      }, err => {
        if (err.code == 409) {
          this.helper.showAlert("You are already a member of this group.", '');

        } else if (err.code == 403) {
          this.helper.showAlert("You are already a member of this group.", '');
        } else {
          this.helper.showAlert("Invitation code is not valid.", 'Error!');
        }
      });
  }

  goToInvite(type: string) {
    switch (type) {
      case this.constant.INVITE_TYPE.CAMPAIGN:
        this.local.getCampaigns()
          .then((_campaigns: Array<any>) => {
            let filteredCamapaigns = this.local.getChronicCampaigns(_campaigns);
            this.local.setLocalCampaigns(filteredCamapaigns.customCampaigns);
            this.navCtrl.setRoot("CampaignPage");
          }).catch(e => {
            this.navCtrl.setRoot("CampaignPage");
          });
        break;
      case this.constant.INVITE_TYPE.CIRCLE:
        this.navCtrl.setRoot("MyCirclesPage");
        break;
      default:
        break;
    }
  }

}
