import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Rest } from '../../../providers/rest';
import { Report, IndicatorModel } from '../../../models/classes';
import { RestDataProvider } from '../../../providers/rest-data-service/rest-data-service';
import { LocalDataProvider } from '../../../providers/local-data/local-data';
import { HistoryProvider } from '../../../providers/history/history';
import { LanguageProvider } from '../../../providers/language/language';
import { Helper } from '../../../providers/helper-service';

@IonicPage()
@Component({
	selector: 'page-report-history',
	templateUrl: 'report-history.html',
})
export class ReportHistoryPage {
	view: string = 'ReportHistoryPage';
	status: string;
	health_indexes: any;
	errorMessage: string;
	total_health_indexes: any;

	// for displaying the health indexes according to the 'updated date'
	updated_date: string;
	temp_health_indexs: any = [];

	//for calendar
	date: any;
	daysInThisMonth: any;
	daysInLastMonth: any;
	daysInNextMonth: any;
	monthNames: string[];
	currentMonth: any;
	currentYear: any;
	currentDate: any;
	monthReport: Array<Report>;
	data_date = new Date();
	indicators: Array<IndicatorModel>;
	data_days: Array<number>;
	lang_resource: any;
	verified: boolean;
	campaign: any;

	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public rest: Rest,
		public local: LocalDataProvider,
		private restService: RestDataProvider,
		private history: HistoryProvider,
		private language_provider: LanguageProvider,
		private helper: Helper
	) {
		this.lang_resource = this.language_provider.getLanguageResource();
		this.data_days = new Array();
		this.status = navParams.get('status');
		this.verified = false;
		this.campaign = this.navParams.get('campaign');
	}

	ionViewDidLoad() {
		// this.updated_date = "Aug 13th, 2017";

		// this.getIndexes();

		this.date = new Date();
		this.monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		this.getDaysOfMonth();
	}

	// getIndexes() {
	// 	this.rest.getHealthIndexes()
	// 		.subscribe(
	// 			health_indexes => {
	// 				this.health_indexes = health_indexes;
	// 				this.total_health_indexes = this.health_indexes.health_index;
	// 				console.log("total: ", this.total_health_indexes);

	// 				//   for (let i = 0; i < this.total_health_indexes.length; i ++){
	// 				//   	if(this.total_health_indexes[i].updated_date == this.updated_date){
	// 				//   		this.temp_health_indexs.push(this.total_health_indexes[i]);
	// 				// } else {

	// 				// }
	// 				//   }           
	// 			},
	// 			error => {
	// 				this.errorMessage = <any>error;
	// 			});
	// };

	public Before = () => {
		// if (this.status == 'campaign-noti-detail') {
		// 	this.navCtrl.setRoot('CampaignNotificationDetailPage', { status: 'campaign' });
		// } else {
		// 	this.navCtrl.setRoot('HealthIndexPage');
		// }
		this.navCtrl.setRoot(this.history.getHistory());
	}

	public Edit = () => {
		this.navCtrl.setRoot('SubmitReportPage', { 'card_index': 0, 'custom': false });
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
				'background-color': 'rgb(172, 167, 174)'
			};
			return styles;
		}
	}

	open(index, item) {
		this.history.addHistory(this.view);
		this.local.localIndexes = this.indicators;
		this.navCtrl.setRoot('SubmitReportPage', { 'card_index': index, 'custom': false });
	}

	//I will change this temp portion to the portion by calendar after complete infinite scroll

	// public temp_aug() {
	// 	this.updated_date = "Aug 13th, 2017";
	// 	this.temp_health_indexs = [];
	// 	this.getIndexes();
	// }

	// public temp_jun() {
	// 	this.updated_date = "Jun 15th, 2017";
	// 	this.temp_health_indexs = [];
	// 	this.getIndexes();
	// }

	// public temp_sep() {
	// 	this.updated_date = "Sep 23th, 2017";
	// 	this.temp_health_indexs = [];
	// 	this.getIndexes();
	// }

	// function for calendar
	getDaysOfMonth() {
		this.daysInThisMonth = new Array();
		this.daysInLastMonth = new Array();
		this.daysInNextMonth = new Array();
		this.currentMonth = this.monthNames[this.date.getMonth()];
		this.currentYear = this.date.getFullYear();
		if (this.date.getMonth() === new Date().getMonth()) {
			this.currentDate = new Date().getDate();
		} else {
			this.currentDate = 999;
		}

		let firstDayThisMonth = new Date(this.date.getFullYear(), this.date.getMonth(), 1).getDay();
		let prevNumOfDays = new Date(this.date.getFullYear(), this.date.getMonth(), 0).getDate();
		for (let i = prevNumOfDays - (firstDayThisMonth - 1); i <= prevNumOfDays; i++) {
			this.daysInLastMonth.push(i);
		}

		let thisNumOfDays = new Date(this.date.getFullYear(), this.date.getMonth() + 1, 0).getDate();
		for (let i = 0; i < thisNumOfDays; i++) {
			this.daysInThisMonth.push(i + 1);
		}

		let lastDayThisMonth = new Date(this.date.getFullYear(), this.date.getMonth() + 1, 0).getDay();
		// let nextNumOfDays = new Date(this.date.getFullYear(), this.date.getMonth() + 2, 0).getDate();
		for (let i = 0; i < (6 - lastDayThisMonth); i++) {
			this.daysInNextMonth.push(i + 1);
		}
		let totalDays = this.daysInLastMonth.length + this.daysInThisMonth.length + this.daysInNextMonth.length;
		if (totalDays < 36) {
			for (let i = (7 - lastDayThisMonth); i < ((7 - lastDayThisMonth) + 7); i++) {
				this.daysInNextMonth.push(i);
			}
		}

		this.getMhiReport()
			.then((report: Array<Report>) => {
				this.monthReport = report;
				this.updateCalendarView();
				if (this.currentDate == new Date().getDate()) {
					this.selectDate(this.currentDate);
				} else {
					this.selectDate(this.date.getDate());
				}
			});
	}

	getMhiReport() {
		return new Promise((resolve) => {
			let month;
			let firstDate;
			let lastDate;
			let m = (this.date.getMonth()) + 1;
			let y = this.date.getFullYear();
			if (m < 10)
				month = '0' + m;
			else
				month = m;

			let fd = this.daysInThisMonth[0];
			if (fd < 10)
				firstDate = '0' + fd;
			else
				firstDate = fd;

			let ld = this.daysInThisMonth[this.daysInThisMonth.length - 1];
			if (ld < 10)
				lastDate = '0' + ld;
			else
				lastDate = ld;

			let fromDate = y + '-' + month + '-' + firstDate;
			let toDate = y + '-' + month + '-' + lastDate;
			this.helper.showLoading();
			this.restService.getMhiReport(fromDate, toDate)
				.subscribe(data => {
					this.helper.hideLoading();
					console.log(data);
					let obj = data.data;
					if (data.success == true) {
						let keys = Object.keys(obj);
						let values = Object.keys(obj).map(key => obj[key]);
						let report = [];
						keys.forEach((key, i) => {
							report.push(new Report(key, values[i]));
						});
						resolve(report);
					}
				}, e => {
					this.helper.hideLoading();
					resolve([]);
				});
		});
	}

	selectDate(day) {
		try {
			let found = false;
			this.currentDate = day;
			this.data_date = new Date(this.date.getFullYear(), this.date.getMonth(), day);

			if (!this.monthReport || this.monthReport.length < 1) {
				this.indicators = [];
			}

			this.monthReport.forEach((item, i, a) => {
				let date = parseInt((item.date).split('-')[2]);
				if (date == day) {
					found = true;
					if (item.report.length != 0) {
						let new_indicators = [];
						//FIXME: this filter not needed now / filter indicators by health index indictors only
						let health_indexes = this.local.getLocalHealthIndexes();
						let c_health_indexes = [];
						if (this.campaign) {
							this.campaign.challengeTemplateInfo.indicatorLst.forEach(c_index => {
								health_indexes.forEach(h_index => {
									if (h_index.code == c_index.code) {
										c_health_indexes.push(h_index);
									}
								});
							});
						} else {
							c_health_indexes = health_indexes;
						}

						item.report.forEach(indicator => {
							c_health_indexes.forEach(index => {
								// (indicator.indicatorCode).toLowerCase().indexOf('cancer') != -1
								let fillCancer = false;
								if (this.isCancer(indicator.indicatorCode)) {
									if (this.haveCancer) {
										fillCancer = true;
									}
								}
								if ((indicator.indicatorCode == index.code) || (fillCancer)) {
									if (new_indicators.length > 0) {
										// merge duplicate entry in report on same date
										let found1 = false;
										new_indicators.forEach((_indicator, i1, a1) => {
											if (_indicator.indicatorCode == indicator.indicatorCode) {
												found1 = true;
												// update status according to last status
												try {
													if (_indicator.lastUpdatedDate < indicator.lastUpdatedDate) {
														_indicator.status = indicator.status;
													}
												} catch (e) {
													console.log(e);
												}

												_indicator.questions.push(indicator.questions);
											} else if (found1 == false && i1 == a1.length - 1) {
												new_indicators.push(indicator);
											}
										});
									} else {
										new_indicators.push(indicator);
									}
								}
							});
						});
						this.indicators = this.local.mapAndGetIndicators(new_indicators, false);
					} else {
						this.indicators = [];
					}
				} else if (found == false && i == a.length - 1) {
					this.indicators = [];
				}
			});
		} catch (e) {
			console.error(e);
		}
	}

	updateCalendarView() {
		try {
			this.data_days = [];
			let temp = this.daysInThisMonth;
			this.daysInThisMonth.forEach((day) => {
				let found = false;
				this.monthReport.forEach((item, i, a) => {
					let date = parseInt((item.date).split('-')[2]);
					if (date == day) {
						found = true;
						if (item.report.length != 0 && this.haveValidIndicators(item.report)) {
							this.data_days.push(date);
						} else {
							this.data_days.push(null);
						}

					} else if (found == false && i == a.length - 1) {
						this.data_days.push(null);
					}
				});
			});
			this.daysInThisMonth = temp;
		} catch (e) {
			console.log(e);
		}

	}

	/**
	 * Check if history contains either MHI indicators or cancers.
	 * @param report 
	 * @return boolean
	 */
	private haveValidIndicators(report: Array<any>): boolean {
		let health_indexes = this.local.getLocalHealthIndexes();
		let flag = false;
		report.forEach(indicator => {
			health_indexes.forEach(h_index => {
				if (h_index.code == indicator.indicatorCode || this.isCancer(indicator.indicatorCode)) {
					if (this.campaign) {
						if (this.isCampaignIndicator(indicator.indicatorCode)) {
							flag = true;
						}
					} else {
						flag = true;
					}

				}
			});
		});
		return flag;
	}

	/** 
	* Checks if campaign have the cancer indicators
	* @returns boolean
	*/
	public get haveCancer(): boolean {
		let flag = false;
		if (this.campaign) {
			this.campaign.challengeTemplateInfo.indicatorLst.forEach(c_index => {
				switch (c_index.code) {
					case "Breast Cancer":
					case "Cervical Cancer":
					case "Colon Cancer":
					case "Lung Cancer":
					case "Prostate Cancer":
						flag = true;
						break;

					default:
						flag = false;
						break;
				}
			});
			return flag;
		} else {
			return true;
		}
	}

	/**
	 * Check if indicator is a cancer indicator
	 * @returns boolean
	 * @param indicator_code
	 */
	public isCancer(code): boolean {
		let flag = false;
		switch (code) {
			case "Breast Cancer":
			case "Cervical Cancer":
			case "Colon Cancer":
			case "Lung Cancer":
			case "Prostate Cancer":
				flag = true;
				break;

			default:
				flag = false;
				break;
		}
		return flag;
	}

	/**
	 * If showing campaign history, check if indicator is for campaign or not
	 * @param indicator_code 
	 * @returns boolean
	 */
	public isCampaignIndicator(indicator_code): boolean {
		let flag = false;
		this.campaign.challengeTemplateInfo.indicatorLst.forEach(c_index => {
			if (indicator_code == c_index.code) {
				flag = true;
			}
		});
		return flag;
	}

	getCancerMHI(cancers: Array<IndicatorModel>) {
		let cancerMhi = 0;
		cancers.forEach(cancer => {
			cancerMhi = cancerMhi + parseInt(cancer.data.mhiIndex);
		});

		return cancerMhi;
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

	goToLastMonth() {
		this.date = new Date(this.date.getFullYear(), this.date.getMonth(), 0);
		this.getDaysOfMonth();
	}

	goToNextMonth() {
		this.date = new Date(this.date.getFullYear(), this.date.getMonth() + 2, 0);
		this.getDaysOfMonth();
	}

	handleError(err) {
		console.log(err);
	}

}
