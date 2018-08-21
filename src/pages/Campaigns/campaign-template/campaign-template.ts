import { Component } from '@angular/core';
import { IonicPage, NavParams, ViewController } from 'ionic-angular';

import { Rest } from '../../../providers/rest';
import { CampaignTemplate } from '../../../models/classes';

@IonicPage()
@Component({
  selector: 'page-campaign-template',
  templateUrl: 'campaign-template.html',
})
export class CampaignTemplatePage {

  // campaignData: any;
  templates: Array<CampaignTemplate>;
  errorMessage: string;
  search_bar: boolean;
  search_query: any;

  constructor(
    public viewCtrl: ViewController,
    public navParams: NavParams,
    public rest: Rest
  ) {
    this.templates = new Array();
  }

  ionViewDidLoad() {
    this.getTemplates();
  }

  getTemplates() {
    this.rest.getTemplates()
      .subscribe(
        data => {
          // this.campaignData = data;
          this.templates = data.templates;
          console.log(this.templates);
        },
        error => {
          this.errorMessage = <any>error;
        });
  }

  // getItems() {
  //   this.templates.filter(template => {
  //     return ((template.template).toLowerCase().indexOf((this.search_query).toLowerCase()) > -1);
  //   })
  // }

  search() {
    console.log('search');
    this.search_bar = !this.search_bar;
  }

  goCreateCampaign(item) {
    console.log("template items: ", item);
    this.viewCtrl.dismiss(item);
  }

  close() {
    this.viewCtrl.dismiss(null);
  }

}
