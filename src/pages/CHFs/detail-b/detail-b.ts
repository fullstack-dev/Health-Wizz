import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import * as HighCharts from 'highcharts';
import { IndicatorView, Report } from '../../../models/classes';
import { RestDataProvider } from '../../../providers/rest-data-service/rest-data-service';
import { HistoryProvider } from '../../../providers/history/history';
import { UserService } from '../../../providers/user-service';
import { LocalDataProvider } from '../../../providers/local-data/local-data';
import { LanguageProvider } from '../../../providers/language/language';
import { Toast } from '@ionic-native/toast';
import { ValidatorProvider } from '../../../providers/validator/validator';

@IonicPage()
@Component({
	selector: 'page-detail-b',
	templateUrl: 'detail-b.html',
})
export class DetailBPage {
	view = 'DetailBPage';
	received_item: IndicatorView;
	validator = new ValidatorProvider();

	// for the button read more
	flag: boolean;

	//for calendar
	date: any;
	daysInThisMonth: any;
	daysInLastMonth: any;
	daysInNextMonth: any;
	monthNames: string[];
	currentMonth: any;
	currentYear: any;
	currentDate: any;
	eventList: any;
	selectedEvent: any;
	isSelected: any;
	temp_date: any;
	temp_value: any;
	showGraph: boolean = false;
	graphLoad: boolean;
	lang_resource: any;
	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		private restService: RestDataProvider,
		private history: HistoryProvider,
		public local: LocalDataProvider,
		private language_provider: LanguageProvider
	) {
		this.lang_resource = this.language_provider.getLanguageResource();
		this.received_item = this.navParams.get('indicator_view');
		if (this.received_item.inputType == 'value') {
			this.graphLoad = true;
		}
	}

	ionViewDidLoad() {
		this.flag = true;
		this.temp_date = [];
		this.temp_value = [];
		this.date = new Date();
		this.monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		this.getDaysOfMonth();

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

	getIndicatorReport(report: Array<Report>): Array<any> {

		try {
			let indicatorReport: Array<{ 'date': any, 'value': number }> = [];
			report.forEach(item => {
				item.report.forEach(indicator => {
					if (indicator.indicatorCode == this.received_item.data.indicatorCode) {
						let date = parseInt((item.date).split('-')[2]);
						let value = indicator.questions[0].value;
						if (this.received_item.inputType == 'value') {
							value = parseInt(value);
						}
						indicatorReport.push({ 'date': date, 'value': (value) });
					}
				});
			});
			return indicatorReport;
		} catch (e) {
			console.log(e);
		}
	}

	initializeChart() {
		if (this.received_item.inputType == 'value') {
			this.graphLoad = false;
			this.showGraph = true;
			let myChart = HighCharts.chart('container', this.drawChart(this.temp_date, this.temp_value));

			//updating calendar dates
			let temp = this.daysInThisMonth;
			this.daysInThisMonth = temp;
		}
	}

	drawChart(arr1, arr2) {
		let temp_chart = {
			chart: {
				type: 'spline'
			},
			title: {
				text: ''
			},
			subtitle: {
				text: ''
			},
			xAxis: {
				tickInterval: 1,
				day: []
			},
			yAxis: {
				title: {
					text: ''
				}
			},
			plotOptions: {
				line: {
					dataLabels: {
						enabled: true
					},
					enableMouseTracking: false
				}
			},
			series: [{
				name: 'value',
				data: [],
				pointStart: 1
			}]
		};

		temp_chart.xAxis.day = arr1;
		temp_chart.series[0].data = arr2;

		return temp_chart;
	}

	public Before = () => {
		this.navCtrl.setRoot(this.history.getHistory(), { 'card_index': this.received_item.index });
	}

	public Done = () => {
		this.history.getHistory();
		this.navCtrl.setRoot('ChfPage');
	}

	public updateLedger(indicatorCode) {
		return new Promise((resolve, reject) => {
			this.restService.updateLedger(indicatorCode)
				.subscribe(r => {
					resolve();
				}, e => {
					reject(e);
				});
		});
	}

	public setDetailStyle() {
		let styles = {
			'overflow': this.flag ? 'hidden' : 'visible',
			'height': this.flag ? '28vw' : 'auto'
		};
		return styles;
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

		this.temp_date = [];
		this.temp_value = [];
		if (this.received_item.inputType == 'value') {
			this.graphLoad = true;
		}

		this.getMhiReport()
			.then((report: Array<Report>) => {
				try {
					let indicatorReport = this.getIndicatorReport(report);
					this.daysInThisMonth.forEach(day => {
						let found = false;
						indicatorReport.forEach((item, i, a) => {
							if (day == item.date) {
								this.temp_date.push(item.date);
								this.temp_value.push(item.value);
								found = true;
							} else if (found == false && i == a.length - 1) {
								this.temp_date.push(day);
								this.temp_value.push(null);
							}
						});
					});
					console.log(this.temp_date);
					console.log(this.temp_value);
					this.initializeChart();
				} catch (e) {
					console.log(e);
				}

			});
	}

	goToLastMonth() {
		this.date = new Date(this.date.getFullYear(), this.date.getMonth(), 0);
		this.getDaysOfMonth();
	}

	goToNextMonth() {
		this.date = new Date(this.date.getFullYear(), this.date.getMonth() + 2, 0);
		this.getDaysOfMonth();
	}

	selectDate(day, index) {
		this.currentDate = day;
		if (this.temp_value[index] != null) {
			this.received_item.newValue = this.temp_value[index];
		}

		// this.isSelected = false;
		// this.selectedEvent = new Array();
		// var thisDate1 = this.date.getFullYear()+"-"+(this.date.getMonth()+1)+"-"+day+" 00:00:00";
		// var thisDate2 = this.date.getFullYear()+"-"+(this.date.getMonth()+1)+"-"+day+" 23:59:59";
		// this.eventList.forEach(event => {
		//   if(((event.startDate >= thisDate1) && (event.startDate <= thisDate2)) || ((event.endDate >= thisDate1) && (event.endDate <= thisDate2))) {
		// this.isSelected = true;
		// this.selectedEvent.push(event);
		//   }
		// });
	}

	deleteEvent(evt) {
		// console.log(new Date(evt.startDate.replace(/\s/, 'T')));
		// console.log(new Date(evt.endDate.replace(/\s/, 'T')));
		// let alert = this.alertCtrl.create({
		//   title: 'Confirm Delete',
		//   message: 'Are you sure want to delete this event?',
		//   buttons: [
		//     {
		//       text: 'Cancel',
		//       role: 'cancel',
		//       handler: () => {
		//         console.log('Cancel clicked');
		//       }
		//     },
		//     {
		//       text: 'Ok',
		//       handler: () => {
		//         this.calendar.deleteEvent(evt.title, evt.location, evt.notes, new Date(evt.startDate.replace(/\s/, 'T')), new Date(evt.endDate.replace(/\s/, 'T'))).then(
		//           (msg) => {
		//             console.log(msg);
		//             // this.loadEventThisMonth();
		//             this.selectDate(new Date(evt.startDate.replace(/\s/, 'T')).getDate());
		//           },
		//           (err) => {
		//             console.log(err);
		//           }
		//         )
		//       }
		//     }
		//   ]
		// });
		// alert.present();
	}

	public setYesFoodActiveStyle(value) {
		let styles = {
			'border-bottom': value == 'YES' ? '1px solid #4BCB99' : 'none',
			'color': '#4BCB99'
		};
		return styles;
	}

	public setNoFoodActiveStyle(value) {
		let styles = {
			'border-bottom': value == 'NO' ? '1px solid #FB4F84' : 'none',
			'color': '#FB4F84'
		};
		return styles;
	}

	public setYesFluidActiveStyle(value) {
		let styles = {
			'border-bottom': value == 'YES' ? '1px solid #4BCB99' : 'none',
			'color': '#4BCB99'
		};
		return styles;
	}

	public setNoFluidActiveStyle(value) {
		let styles = {
			'border-bottom': value == 'NO' ? '1px solid #FB4F84' : 'none',
			'color': '#FB4F84'
		};
		return styles;
	}

	// let swelling colors
	public setFirstActiveStyle(value) {
		let styles = {
			'border-bottom': value == 'SLIGHT' ? '1px solid #4BCB99' : 'none',
			'color': '#4BCB99'
		};
		return styles;
	}

	public setSecondActiveStyle(value) {
		let styles = {
			'border-bottom': value == 'SOME' ? '1px solid #FFBC00' : 'none',
			'color': '#FFBC00'
		};
		return styles;
	}

	public setThirdActiveStyle(value) {
		let styles = {
			'border-bottom': value == 'LOT' ? '1px solid #FB4F84' : 'none',
			'color': '#FB4F84'
		};
		return styles;
	}

	public setNoBreathActiveStyle(value) {
		let styles = {
			'border-bottom': value == 'NO' ? '1px solid #4BCB99' : 'none',
			'color': '#4BCB99'
		};
		return styles;
	}

	public setSomeBreathActiveStyle(value) {
		let styles = {
			'border-bottom': value == 'SOME' ? '1px solid #FFBC00' : 'none',
			'color': '#FFBC00'
		};
		return styles;
	}

	public setMuchBreathActiveStyle(value) {
		let styles = {
			'border-bottom': value == 'VERY MUCH' ? '1px solid #FB4F84' : 'none',
			'color': '#FB4F84'
		};
		return styles;
	}

	public setYesMedActiveStyle(value) {
		let styles = {
			'border-bottom': value == 'YES' ? '1px solid #4BCB99' : 'none',
			'color': '#4BCB99'
		};
		return styles;
	}

	public setNoMedActiveStyle(value) {
		let styles = {
			'border-bottom': value == 'NO' ? '1px solid #FB4F84' : 'none',
			'color': '#FB4F84'
		};
		return styles;
	}

	public goToConnectedDeviceFromBMI() {
		this.navCtrl.setRoot('ConnectedDevicePage');
	}

	public goToConnectedDeviceFromBreath() {
		this.navCtrl.setRoot('ConnectedDevicePage');
	}

	public goToConnectedDeviceFromPulse() {
		this.navCtrl.setRoot('ConnectedDevicePage');
	}

	public goToConnectedDeviceFromOxygen() {
		this.navCtrl.setRoot('ConnectedDevicePage');
	}

	public handleError(error) {
		console.log(error);
	}

}
