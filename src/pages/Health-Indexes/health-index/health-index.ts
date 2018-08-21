import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Rest } from '../../../providers/rest';
import { IndicatorModel } from '../../../models/classes';
import { RestDataProvider } from '../../../providers/rest-data-service/rest-data-service';
import { LocalDataProvider } from '../../../providers/local-data/local-data';
import { HistoryProvider } from '../../../providers/history/history';
import { LanguageProvider } from '../../../providers/language/language';
@IonicPage()
@Component({
	selector: 'page-health-index',
	templateUrl: 'health-index.html'
})
export class HealthIndexPage {

	view: string = 'HealthIndexPage';
	lastDate: any;

	indicators: Array<IndicatorModel>;

	health_indexes: any;
	errorMessage: string;
	health_indexes_items: any;

	health_score: number;
	health_red_count: number;
	health_green_count: number;
	health_yellow_count: number;

	health_red_percent: number;
	health_green_percent: number;
	health_yellow_percent: number;
	lang_resource: any;
	wellness_exam_status: any;
	received_lastDate: any;
	updated_lastDate: any;
	cancer_mhi_index: number = 0;
	wellness_exam_mhi_index: number = 0;

	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public rest: Rest,
		public restService: RestDataProvider,
		public local: LocalDataProvider,
		private history: HistoryProvider,
		private language_provider: LanguageProvider
	) {
		this.lang_resource = this.language_provider.getLanguageResource();
	}

	ionViewDidLoad() {

		this.lastDate = this.navParams.get('lastDate');

		this.health_score = 0;
		this.health_red_count = 0;
		this.health_green_count = 0;
		this.health_yellow_count = 0;

		this.health_red_percent = 0;
		this.health_green_percent = 0;
		this.health_yellow_percent = 0;

		this.indicators = this.local.localIndexes;

		setTimeout(() => {
			let cancers = this.indicators.find(item => {
				return item.info.code == 'Cancer';
			})
			if (cancers) {
				this.cancer_mhi_index = this.getCancerMHI(cancers.data);
			}
		}, 100);

		this.getIndicators();
	}

	public getIndicators() {
		this.local.getMhiStatus()
			.then((indicators: Array<any>) => {
				this.getWellnessExam(indicators);
				// this.indicators = this.local.mapAndGetIndicators(indicators, true);
				this.calculateScores(indicators);
				// this.local.localIndexes = this.indicators;				
			});
	}

	public getWellnessExam(indicators: any[]) {
		indicators.forEach(indicator => {
			if (indicator.indicatorCode == "Last Health Checkup") {
				this.wellness_exam_status = indicator.status;
				this.wellness_exam_mhi_index = this.getWellnessExamMhiIndex(indicator);
				if (indicator.questions[0].value != null && indicator.questions[0].value != "null") {
					let updated_lastDate = new Date(parseInt(indicator.questions[0].value));
					this.received_lastDate = updated_lastDate;

				} else {
					this.received_lastDate = null;
				}
			}
		});
	}

	getWellnessExamMhiIndex(wellness_indicator) {
		let mhi = 0;
		if (wellness_indicator.mhiIndex) {
			mhi = wellness_indicator.mhiIndex;
		}
		return mhi;
	}

	public calculateScores(indicators: any[]) {
		indicators.forEach(indicator => {
			if (indicator.indicatorCode == "CompositeScore") {
				this.health_score = indicator.calculatedValue;
			}
		});
		let red = 0;
		let yellow = 0;
		let green = 0;
		this.indicators.forEach(indicator => {
			let status = indicator.data.status;
			if (indicator.info.code == 'Cancer') {
				status = this.getCancerStatus(indicator.data);
			}
			if (status == 'RED') {
				red = red + 1;
			}
			if (status == 'YELLOW') {
				yellow = yellow + 1;
			}
			if (status == 'GREEN') {
				green = green + 1;
			}

		});

		this.health_red_count = red;
		this.health_yellow_count = yellow;
		this.health_green_count = green;
		let total_count = this.health_red_count + this.health_green_count + this.health_yellow_count;
		this.health_red_percent = Math.round(this.health_red_count / total_count * 100);
		this.health_yellow_percent = Math.round(this.health_yellow_count / total_count * 100);
		this.health_green_percent = 100 - this.health_red_percent - this.health_yellow_percent;

		this.drawIndex();
	}

	public drawIndex() {
		let c: any = document.getElementById("myCanvas");

		let ctx_red = c.getContext("2d");
		let centerX_red = c.width / 4;
		let centerY_red = c.height / 2;
		let radius_red = 50;
		ctx_red.beginPath();
		ctx_red.arc(centerX_red, centerY_red, radius_red, Math.PI / 2, 2 * this.health_red_percent * Math.PI / 100 + Math.PI / 2, false);
		ctx_red.lineWidth = 10;
		ctx_red.strokeStyle = '#FB4F84';
		ctx_red.stroke();

		let ctx_yellow = c.getContext("2d");
		let centerX_yellow = c.width / 4;
		let centerY_yellow = c.height / 2;
		let radius_yellow = 60;
		ctx_yellow.beginPath();
		ctx_yellow.arc(centerX_yellow, centerY_yellow, radius_yellow, Math.PI / 2, 2 * this.health_yellow_percent * Math.PI / 100 + Math.PI / 2, false);
		ctx_yellow.lineWidth = 10;
		ctx_yellow.strokeStyle = '#FFBC00';
		ctx_yellow.stroke();

		let ctx_green = c.getContext("2d");
		let centerX_green = c.width / 4;
		let centerY_green = c.height / 2;
		let radius_green = 70;
		ctx_green.beginPath();
		ctx_green.arc(centerX_green, centerY_green, radius_green, Math.PI / 2, 2 * this.health_green_percent * Math.PI / 100 + Math.PI / 2, false);
		ctx_green.lineWidth = 10;
		ctx_green.strokeStyle = '#4BCB99';
		ctx_green.stroke();
	}

	public Before = () => {
		this.navCtrl.setRoot('HomePage');
	}

	public goToMyHealthIndex() {
		this.navCtrl.push('MyHealthIndexPage', { 'indexes': this.indicators });
	}

	public goToWellnessExam = () => {
		this.navCtrl.setRoot('WellnessExamPage', { lastDate: this.lastDate });
	}

	public goToHistory = () => {
		this.history.addHistory(this.view);
		this.navCtrl.setRoot('ReportHistoryPage');
	}

	public goToUpdate = () => {
		this.history.addHistory(this.view);
		this.navCtrl.setRoot('SubmitReportPage', { 'card_index': 0, 'custom': false });
	}

	// go to SubmitReportPage
	public open(index, item: IndicatorModel) {
		this.history.addHistory(this.view);
		this.navCtrl.setRoot('SubmitReportPage', { 'card_index': index, 'custom': false });
	}

	setMyStyles(item) {
		if (item == 'RED') {
			let styles = {
				'background-color': '#FB4F84'
			};
			return styles;
		} else if (item == 'GREEN') {
			let styles = {
				'background-color': '#4BCB99'
			};
			return styles;
		} else if (item == 'YELLOW') {
			let styles = {
				'background-color': '#FFBC00'
			};
			return styles;
		} else {
			let styles = {
				'background-color': '#73736F'
			};
			return styles;
		}
	}

	setCancerStyle(cancers: Array<IndicatorModel>) {
		let status = this.getCancerStatus(cancers);
		return this.setMyStyles(status);
	}

	getCancerStatus(cancers: Array<IndicatorModel>) {
		let status = 'NA';
		let haveRed = false;
		let haveYellow = false;
		cancers.forEach(cancer => {
			if (cancer.data.status == 'RED') {
				haveRed = true;
				status = 'RED';
			}
			if (haveRed == false && cancer.data.status == 'YELLOW') {
				haveYellow = true;
				status = 'YELLOW';
			}
			if (haveRed == false && haveYellow == false && cancer.data.status == 'GREEN') {
				status = 'GREEN';
			}
		});
		return status;
	}

	getCancerMHI(cancers: Array<IndicatorModel>) {
		let cancerMhi = 3;
		cancers.forEach(cancer => {
			// cancerMhi += parseInt(cancer.data.mhiIndex);
			if (cancer.data.status != 'GREEN' && cancer.data.status != 'RED' && cancer.data.status != 'YELLOW') {
				// skip
			} else if (cancer.data.status != 'GREEN') {
				cancerMhi = 0;
			}
		});
		return cancerMhi;
	}

	handleError(err) {
		console.log(err);
	}

}
