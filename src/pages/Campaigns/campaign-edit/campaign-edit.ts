import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, ViewController, NavParams, ToastController, Slides } from 'ionic-angular';

import { Rest } from '../../../providers/rest';
import { LocalDataProvider } from '../../../providers/local-data/local-data';

@IonicPage()
@Component({
  selector: 'page-campaign-edit',
  templateUrl: 'campaign-edit.html',
})
export class CampaignEditPage {

  @ViewChild(Slides) slides: Slides;
  value = '';
  changeText(value: string) { this.value = value; }

  campData: any = {};
  errorMessage: string;
  scheduals: any;
  types: any;
  page: number;

  virtualData: any;
  rewardsData: any;
  indexData: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public toastCtrl: ToastController,
    public rest: Rest,
    public local: LocalDataProvider,
  ) {

    this.campData =
      {
        id: 0, camp_name: 'Med Rex Campaign', s_date: '2017-08-30', e_date: '', description: 'I am Senior Ionic app deveoper', private_val: true,
        term1: 'Test Term', question1: 'First Question', report: 2, question_type: 2, answer1: 'Answer 1', totalAmount: '120',
        rewardList: [{ description: 'for running 12 days in a row', amount: '50' },
        { description: 'for running 5 days in a row', amount: '70' }
        ]

      };

    this.page = 0;

    this.scheduals = [{ id: 0, name: 'Daily' }, { id: 1, name: 'Weekly' },
    { id: 2, name: 'Every two weeks' }, { id: 3, name: 'Monthly' },
    { id: 4, name: 'Once in a lifetime' }
    ];

    this.types = [{ id: 0, type: 'Yes/No' }, { id: 1, type: 'TEXTFIELD' },
    { id: 2, type: 'Single Choice' }, { id: 3, type: 'MULTIPLE CHOICE' }
    ];
  }

  ionViewDidLoad() {
    this.getCampaigns();
  }

  ngAfterViewInit() {
    this.slides.lockSwipes(true);
  }

  getCampaigns() {
    this.rest.getCampaigns()
      .subscribe(
        data => {
          this.virtualData = data;
          this.rewardsData = this.virtualData.rewards;
          this.indexData = this.virtualData.indexs;
          console.log(this.virtualData);
        },
        error => {
          this.errorMessage = <any>error;
        });
  }

  getDate(date) {
    let today;
    let dd = date.getDate();
    let mm = date.getMonth() + 1;
    let yyyy = date.getFullYear();
    if (dd < 10) {
      dd = '0' + dd;
    }
    if (mm < 10) {
      mm = '0' + mm;
    }
    console.log(today);
    return today = yyyy + '-' + mm + '-' + dd;

  }

  slideChanged() {
    this.page = this.slides.getActiveIndex();
    console.log(this.page);
  }

  infoNext() {

    let toast = this.toastCtrl.create({
      message: 'Please Fill Valid Forms', duration: 2000, position: 'bottom',
    });

    if (!this.campData.camp_name || !this.campData.s_date || !this.campData.description) {
      toast.present();
    } else {
      this.goSlide(1);
    }
  }

  termNext() {

    let toast = this.toastCtrl.create({
      message: 'Please Fill Valid Forms', duration: 2000, position: 'bottom',
    });
    if (!this.campData.term1) {
      toast.present();
    } else {
      this.goSlide(1);
    }

  }

  goSlide(value) {
    this.slides.lockSwipes(false);
    this.page = this.page + value;
    this.slides.slideTo(this.page, 500);
    this.slides.lockSwipes(true);
  }

  showIndexItem(event, item) {

    item.value = !item.value;

  }

  duplicateReward() {

    let reward_val = { des: '', amount: '' }
    this.campData.rewardList.push(reward_val);
    console.log(this.campData.rewardList);
  }

  getAmounts(list) {
    this.campData.totalAmount = 0;
    for (let i = 0; i < list.length; i++) {
      this.campData.totalAmount = this.campData.totalAmount + Number(list[i].amount);
    }
    console.log(this.campData.totalAmount);
    return this.campData.totalAmount;
  }

  save() {

    let updateToast = this.toastCtrl.create({
      message: 'Campaign Data is Updated', duration: 2000, position: 'middle',
    });
    updateToast.present();

    this.close();
  }

  close() {
    this.navCtrl.setRoot('CampaignPage');
  }

}
