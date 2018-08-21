import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Rest } from '../../../providers/rest';
import { HistoryProvider } from '../../../providers/history/history';
import { IndicatorView, Report, CDView } from '../../../models/classes';
import { RestDataProvider } from '../../../providers/rest-data-service/rest-data-service';
import { LocalDataProvider } from '../../../providers/local-data/local-data';
import { LanguageProvider } from '../../../providers/language/language';

@IonicPage()
@Component({
	selector: 'page-report-history-b',
	templateUrl: 'report-history-b.html',
})
export class ReportHistoryBPage {
	view = 'ReportHistoryBPage';
	chfs: any;
	errorMessage: string;
	chfs_items: any;

	//for calendar
	date: any;
	daysInThisMonth: any;
	daysInLastMonth: any;
	daysInNextMonth: any;
	monthNames: string[];
	currentMonth: any;
	currentYear: any;
	currentDate: any;
	data_days: Array<number>;
	eventList: any;
	selectedEvent: any;
	isSelected: any;

	graph_value: any;

	temp_date: any;
	temp_value: any;
	indicators: Array<IndicatorView>;
	cdView: CDView;
	campaign: any;
	monthReport: Array<Report>;
	data_date = new Date();
	frequencies: Array<any>;
	lang_resource: any;
	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public rest: Rest,
		private history: HistoryProvider,
		private restService: RestDataProvider,
		public local: LocalDataProvider,
		private language_provider: LanguageProvider
	) {
		this.lang_resource = this.language_provider.getLanguageResource();
		this.data_days = [];
	}

	ionViewDidLoad() {
		this.campaign = this.local.getLocalCampaign();
		this.rest.getCDs().subscribe((data) => {
			data.diseases.forEach(d => {
				if (d.name = this.campaign.challengeTemplateInfo.name) {
					this.cdView = new CDView(this.campaign.challengeTemplateInfo, d);
				}
			});
		});

		this.rest.getFrequencies()
			.subscribe((_frequencies) => {
				this.frequencies = _frequencies.frequency;
			});

		this.date = new Date();
		this.monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		this.getDaysOfMonth();
	}

	public Before = () => {
		this.navCtrl.setRoot(this.history.getHistory());
	}

	public Edit = () => {
		if (!this.indicators || this.indicators.length == 0) {
			return false;
		}
		this.history.addHistory(this.view);
		this.local.setLocalIndicators(this.indicators);
		this.navCtrl.setRoot('SubmitReportBPage', {
			'card_index': 0,
			'data_date': this.data_date
		});
	}

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
			this.restService.getMhiReport(fromDate, toDate)
				.subscribe(data => {
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
				}, this.handleError);
		});
	}

	goToLastMonth() {
		this.date = new Date(this.date.getFullYear(), this.date.getMonth(), 0);
		this.indicators = null;
		this.getDaysOfMonth();
	}

	goToNextMonth() {
		this.date = new Date(this.date.getFullYear(), this.date.getMonth() + 2, 0);
		this.indicators = null;
		this.getDaysOfMonth();
	}

	selectDate(day) {
		let found = false;
		this.currentDate = day;
		this.data_date = new Date(this.date.getFullYear(), this.date.getMonth(), day);

		if (!this.monthReport || this.monthReport.length < 1) {
			this.indicators = [];
		} else {
			this.monthReport.forEach((item, i, a) => {
				let date = parseInt((item.date).split('-')[2]);
				if (date == day) {
					found = true;
					if (item.report != []) {
						this.indicators = this.local.getChfIndicators(item.report, this.cdView.info.indicators, this.frequencies);
					} else {
						this.indicators = [];
					}
				} else if (found == false && i == a.length - 1) {
					this.indicators = [];
				}
			});
		}
		console.log(this.indicators);
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
						if (item.report != []) {
							let chfReport = this.local.getChfIndicators(item.report, this.cdView.info.indicators, this.frequencies);
							if (chfReport.length > 1) {
								this.data_days.push(date);
							} else {
								this.data_days.push(null);
							}
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

	deleteEvent(evt) {
	}

	public open(index, item: IndicatorView) {
		this.history.addHistory(this.view);
		this.local.setLocalIndicators(this.indicators);
		this.navCtrl.setRoot('SubmitReportBPage', {
			'card_index': index,
			'data_date': this.data_date
		});
	}

	setMyStyles(item) {
		if (item == 'RED') {
			let styles = {
				'background-color': '#EA6288'
			};
			return styles;
		} else if (item == 'GREEN') {
			let styles = {
				'background-color': '#6EC59A'
			};
			return styles;
		} else if (item == 'YELLOW') {
			let styles = {
				'background-color': '#FDBA45'
			};
			return styles;
		} else {
			let styles = {
				'background-color': '#73736F'
			};
			return styles;
		}
	}

	public goToDetail(item) {
		this.navCtrl.setRoot('DetailBPage', { item: item });
	}

	handleError(error) {
		console.log(error);
	}

}
