import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, ViewController, ModalController, PopoverController, NavParams, Slides } from 'ionic-angular';

import { Rest } from '../../../providers/rest';
import { CampaignCategory } from '../../../models/classes';
import { UserService } from '../../../providers/user-service';
import { LocalDataProvider } from '../../../providers/local-data/local-data';

@IonicPage()
@Component({
  selector: 'page-campaign-duplicate',
  templateUrl: 'campaign-duplicate.html',
})
export class CampaignDuplicatePage {

  @ViewChild('activeSlides') active_slides: Slides;
  @ViewChild('historySlides') history_slides: Slides;
  userId: string;
  errorMessage: string;
  myInput: string;
  search_bar: boolean;
  search_query: any;
  active_campaigns: CampaignCategory;
  history_campaigns: CampaignCategory;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public modalCtrl: ModalController,
    public popoverCtrl: PopoverController,
    private userService: UserService,
    public rest: Rest,
    public local: LocalDataProvider
  ) {
    this.search_bar = false;
    this.userId = this.userService.getUserId();
  }

  ionViewDidLoad() {
    this.active_campaigns = this.navParams.get('active_campaigns');
    this.history_campaigns = this.navParams.get('history_campaigns');
  }

  setDuplicate(item) {
    this.viewCtrl.dismiss(item);
  }

  before() {
    this.viewCtrl.dismiss(null);
  }

  search() {
    this.search_query = null;
    try {
      setTimeout(() => {
        this.active_slides.slideTo(0);
      }, 100);

      setTimeout(() => {
        this.history_slides.slideTo(0);
      }, 100);

    } catch (e) {
      console.log(e);
    }
    this.search_bar = !this.search_bar;
  }

  onSearchInput() {
    try {
      setTimeout(() => {
        if (this.active_slides.getActiveIndex() > 0) {
          this.active_slides.slideTo(0);
        }
      }, 100);
      setTimeout(() => {
        if (this.history_slides.getActiveIndex() > 0) {
          this.history_slides.slideTo(0);
        }
      }, 100);
    } catch (e) {
      console.log(e);
    }

  }

  // public onCancel($event) {
  //   this.search_bar = !this.search_bar;
  // }
}
