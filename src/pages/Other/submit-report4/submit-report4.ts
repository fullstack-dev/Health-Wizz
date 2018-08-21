import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides } from 'ionic-angular';
import { Rest } from '../../../providers/rest';

@IonicPage()
@Component({
	selector: 'page-submit-report4',
	templateUrl: 'submit-report4.html',
})
export class SubmitReport4Page {

	@ViewChild(Slides) slides: Slides;
	value = '';
	changeText(value: string) { this.value = value; }

	page: number;
	otherData: any;
	surveyList: any;
	errorMessage: any;
	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public rest: Rest
	) {
		this.page = 0;
	}

	ionViewDidLoad() {
		this.getSurveyData();
	}

	getSurveyData() {
		this.rest.getOtherData()
			.subscribe(
				data => {
					this.otherData = data;
					this.surveyList = this.otherData.report4;
				},
				error => {
					this.errorMessage = <any>error;
				});
	}

	slideChanged() {
		this.page = this.slides.getActiveIndex();
		if (this.page == 4) {
			this.page = 3;
		}
		console.log(this.page);
	}

	before() {

		this.navCtrl.setRoot('CampaignPage');
	}

	done() {
		this.navCtrl.setRoot('CongratulationsPage', { page: 'report4' });
	}

}
