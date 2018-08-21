import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, ToastController } from 'ionic-angular';
import { LocalDataProvider } from '../../../providers/local-data/local-data';
@IonicPage()
@Component({
  selector: 'page-deposit',
  templateUrl: 'deposit.html',
})
export class DepositPage {

  saveCardVisible: boolean;
  omcValue: any;
  dollarValue: any;
  unitOmcDollar: any;
  unitOmcETH: any;
  @ViewChild(Slides) slides: Slides;

  visaSelect: boolean;
  paypalSelect: boolean;
  americanExpressSelect: boolean;

  nameOfCard: string;
  numberOfCard: string;
  month: number;
  year: number;
  cvv: number;

  values: any;
  selectedValue: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public toastCtrl: ToastController,
    public local: LocalDataProvider
  ) {
    this.unitOmcDollar = 0.027;
    this.unitOmcETH = 0.000045;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DepositPage');

    this.saveCardVisible = true;

    this.visaSelect = true;
    this.paypalSelect = false;
    this.americanExpressSelect = false;

    this.selectedValue = 0;

    this.values = [{ id: 0, property: 'USD' }, { id: 1, property: 'ETH' }];

  }

  slideChanged() {
    let currentIndex = this.slides.getActiveIndex();
    console.log('Current index is', currentIndex);
    // this.slides.lockSwipes(true);

  }

  // select change function
  public onSelectChange($event) {
    this.omgToDollar($event);
  }

  // Choose proposal
  public omgToDollar($event) {
    if (this.selectedValue == 0) {
      this.dollarValue = (this.omcValue * this.unitOmcDollar).toFixed(4);
      if (this.dollarValue == 0.0000) {
        this.dollarValue = 0;
      }
    } else {
      this.dollarValue = (this.omcValue * this.unitOmcETH).toFixed(4);
      if (this.dollarValue == 0.0000) {
        this.dollarValue = 0;
      }
    }
  }

  public dollarToOmc($event) {
    if (this.selectedValue == 0) {
      this.omcValue = (this.dollarValue / this.unitOmcDollar).toFixed(4);
      if (this.omcValue == 0.0000) {
        this.omcValue = 0;
      }

    } else {
      this.omcValue = (this.dollarValue / this.unitOmcETH).toFixed(4);
      if (this.omcValue == 0.0000) {
        this.omcValue = 0;

      }
    }
  }

  public before = () => {
    this.navCtrl.setRoot('MyWalletPage');
  }

  public proposalNextClick = () => {
    if (this.omcValue) {
      // this.slides.lockSwipes(false);
      this.slides.slideNext();
    } else {
      let toast = this.toastCtrl.create({
        message: 'Please input the value of OmPoints or Amount in $.',
        duration: 2000,
        position: 'middle',
        cssClass: "toastCss",
      });
      toast.present();
    }
  }

  public proposalCancelClick = () => {
    this.navCtrl.setRoot('MyWalletPage');
  }

  //Choose payment method
  public AddNewCord = () => {

  }

  public visaClick = () => {
    if (this.visaSelect) {
      this.paypalSelect = false;
      this.americanExpressSelect = false;

      this.slides.slideNext();
    }

  }

  public paypalClick = () => {
    if (this.paypalSelect) {
      this.visaSelect = false;
      this.americanExpressSelect = false;

      this.slides.slideNext();
    }
  }

  public expressClick = () => {
    if (this.americanExpressSelect) {
      this.visaSelect = false;
      this.paypalSelect = false;

      this.slides.slideNext();
    }
  }

  public cardNextClick = () => {
    this.slides.slideNext();
  }

  public cardBackClick = () => {
    this.slides.slidePrev();
  }

  //Fill out the info
  public loginClick = () => {

  }

  public forgottenClick = () => {

  }

  public signupClick = () => {

  }

  public inputNextClick = () => {

    if (this.nameOfCard && this.numberOfCard && this.month && this.year && this.cvv) {
      console.log("@@ card information: ", this.nameOfCard + "," + this.numberOfCard)

      this.slides.slideNext();
    } else {
      let toast = this.toastCtrl.create({
        message: 'Please input all of information of Card.',
        duration: 2000,
        position: 'middle',
        cssClass: "toastCss",
      });
      toast.present();
    }
  }

  public inputBackClick = () => {
    this.slides.slidePrev();
  }

  //Confirm
  public confirmByeClick = () => {
    // this.navCtrl.setRoot('DepositFailurePage');
    this.navCtrl.setRoot('DepositSuccessPage');
  }

  public confirmBackClick = () => {
    this.slides.slidePrev();
  }

}
