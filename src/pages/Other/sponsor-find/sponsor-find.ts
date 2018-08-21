import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, ModalController, ViewController, NavParams, Slides } from 'ionic-angular';
import { EmailComposer } from '@ionic-native/email-composer';
import { Helper } from '../../../providers/helper-service';
import { Toast } from '@ionic-native/toast';

@IonicPage()
@Component({
  selector: 'page-sponsor-find',
  templateUrl: 'sponsor-find.html',
})
export class SponsorFindPage {

  @ViewChild(Slides) slides: Slides;

  page: number;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public modalCtrl: ModalController,
    public emailComposer: EmailComposer,
    private helper: Helper,
    private toast: Toast
  ) {
    this.page = 0;
    setTimeout(() => {
      if (this.slides) {
        this.slides.lockSwipes(true);
      }
    }, 300);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SponsorFindPage');
  }

  goSlide() {

    this.helper.getAmount()
      .then(amount => {
        if (amount) {
          if (amount < 25) {
            this.toast.showShortBottom("Minimum amount is $25.").subscribe((r => { }));
            this.goSlide();
            return;
          } else {
            this.helper.sendEmailForShop("buying OmPoints for $" + amount, "Request to buy OmPoints")
              .then(r => {
                this.page = this.page + 1;
                this.slides.lockSwipes(false);
                this.slides.slideTo(this.page, 500);
                this.slides.lockSwipes(true);
              }).catch(e => {
                console.log(e);
              });
          }
        }
      }).catch(e => {
        console.log(e);
      });
  }

  goCampaignPage() {
    let partFeeModal = this.modalCtrl.create('CampaignPage', { value: 'invite' });
    partFeeModal.onDidDismiss(data => {
      this.goSlide()
    });
    partFeeModal.present();
  }

  sendEmail() {

    let email = {
      to: 'minorumadamr@hotmail.com',
      subject: 'Test Sample',
      body: 'How are you? Raj, I am freelancer',
      isHtml: true
    };
    let that = this;
    that.emailComposer.open(email).then(function (res) {
      console.log(res);
      this.goSlide();
    });
  }

  close() {
    this.viewCtrl.dismiss();
  }

  configure() {
    this.viewCtrl.dismiss({ value: this.page });
  }

}
