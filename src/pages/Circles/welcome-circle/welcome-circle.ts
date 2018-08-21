import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Rest } from '../../../providers/rest';
import { HistoryProvider } from '../../../providers/history/history';
import { LanguageProvider } from '../../../providers/language/language';

/**
 * Generated class for the WelcomeCirclePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-welcome-circle',
  templateUrl: 'welcome-circle.html',
})
export class WelcomeCirclePage {
  view: string = "WelcomeCirclePage";
  available_circles: any;
  errorMessage: string;
  available_circles_items: any;

  title: string = "Circle";

  visibleSearch: boolean;
  visibleArrow: boolean;
  visibleNoCircle: boolean;

  searchClick: boolean;
  lang_resource: any;

  myInput: string;

  // items: Array<string>;
  items: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public rest: Rest,
    private history: HistoryProvider,
    private language_provider: LanguageProvider
  ) {
    this.visibleSearch = false;
    this.visibleArrow = true;
    this.visibleNoCircle = true;

    this.searchClick = false;
    this.lang_resource = this.language_provider.getLanguageResource();
  }

  ionViewDidLoad() {
    this.title = "Circles";

    this.getAvailableCircles();
  }

  getAvailableCircles() {
    this.rest.getCircles()
      .subscribe(
        available_circles => {
          this.available_circles = available_circles;
          this.available_circles_items = this.available_circles.available_circles;
          this.setItems();
        },
        error => {
          this.errorMessage = <any>error;
        });
  };

  public Before = () => {
    this.navCtrl.setRoot('HomePage');
  }

  public Add = () => {
    this.history.addHistory(this.view);
    this.navCtrl.setRoot('CreateCirclePage');
  }

  public Search = () => {
    this.visibleSearch = !this.visibleSearch;

    this.searchClick = !this.searchClick;

    this.EmptyClick();
  }

  public EmptyClick = () => {
    // get elements
    // var element   = document.getElementById('empty_area');

    // set default style for textarea
    // element.style.minHeight  = '0';
    // element.style.height     = '0';

    // this.title = "My Circles";
    this.visibleArrow = false;
    this.visibleNoCircle = false;
  }

  public AvailableCirclesItemSelected(item) {
    this.navCtrl.setRoot('CirclePage', { circle: item, from: "welcome-circle" });
  }

  setItems() {
    this.items = this.available_circles_items;
    console.log("available circlessss: ", this.items);
  }

  public onInput(ev: any) {
    this.setItems();
    let val = ev.target.value;

    if (val && val.trim() !== '') {
      this.items = this.items.filter(function (item) {
        return (item.name.toLowerCase().indexOf(val.toLowerCase()) > -1);
      });
    }
  }

  public onCancel($event) {
    this.searchClick = !this.searchClick;
  }

}
