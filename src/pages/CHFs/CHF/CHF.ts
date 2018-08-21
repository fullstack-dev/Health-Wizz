import { Component } from '@angular/core';
import { IonicPage, Platform, NavController, NavParams } from 'ionic-angular';

import { Rest } from '../../../providers/rest';
import { RestDataProvider } from '../../../providers/rest-data-service/rest-data-service';
import { IndicatorView, CDView } from '../../../models/classes';
import { LocalDataProvider } from '../../../providers/local-data/local-data';
import { HistoryProvider } from '../../../providers/history/history';
import { LanguageProvider } from '../../../providers/language/language';

@IonicPage()
@Component({
	selector: 'page-chf',
	templateUrl: 'CHF.html',
})

export class ChfPage {
	view = 'ChfPage';
	parameter: string;
	date_showing: boolean = false;

	chfs: any;
	errorMessage: string;
	chfs_items: any;

	campaign: any;
	indicators: Array<IndicatorView>;
	cdView: CDView;
	chfLastUpdate: any;
	lang_resource: any;
	constructor(
		public platform: Platform,
		public navCtrl: NavController,
		public navParams: NavParams,
		public rest: Rest,
		public restService: RestDataProvider,
		public local: LocalDataProvider,
		private history: HistoryProvider,
		private language_provider: LanguageProvider
	) {
		this.lang_resource = this.language_provider.getLanguageResource();
		this.chfLastUpdate = this.local.getCampaignLastUpdate();

		this.campaign = this.local.getLocalCampaign();

		this.rest.getCDs().subscribe((data) => {
			data.diseases.forEach(d => {
				if (d.name = this.campaign.challengeTemplateInfo.name) {
					this.cdView = new CDView(this.campaign.challengeTemplateInfo, d);
				}
			});
		});

		let frequencies = [];
		this.rest.getFrequencies()
			.subscribe((_frequencies) => {
				frequencies = _frequencies.frequency;
			});
		this.getMhiStatus()
			.then((indicators: Array<any>) => {
				this.indicators = this.local.getChfIndicators(indicators, this.cdView.info.indicators, frequencies);
				this.local.setCampaignLastUpdate(indicators)
					.then(r => {
						this.chfLastUpdate = this.local.getCampaignLastUpdate();
					})
			});
	}

	// ionViewDidEnter() {
	// 	this.parameter = this.navParams.get('status'); 
	// 	console.log(this.parameter);

	// 	if(this.parameter == "notAccept"){
	// 		this.date_showing = false;
	// 	}else if(this.parameter == "Accept"){
	// 		this.date_showing = true;
	// 	}else{
	// 		this.date_showing = false;
	// 	}
	// }

	ionViewDidLoad() {
		// this.getCHFs();
	}

	public getAnswer(value: string) {
		if (value == "VERY MUCH") {
			return "A Lot";
		}
		return value;
	}

	public getMhiStatus() {
		return new Promise((resolve) => {
			this.restService.getMhiStatus()
				.subscribe(mhiStatus => {
					resolve(mhiStatus.data);
				}, this.handleError);
		});
	}

	public Before = () => {
		this.navCtrl.setRoot(this.history.getHistory());
	}

	public goToCCD = () => {
		this.navCtrl.setRoot('MyMedRecordsPage');
	}

	public goToDeny = () => {
		this.navCtrl.setRoot('HomePage');
	}

	public goToAccept = () => {
		// this.navCtrl.setRoot('SubmitReportBPage', {status: 'Accept'});
	}

	public goToHistory = () => {
		this.history.addHistory(this.view);
		this.navCtrl.setRoot('ReportHistoryBPage');
	}

	public goToUpdateAll = () => {
		this.history.addHistory(this.view);
		this.local.setLocalIndicators(this.indicators);
		this.navCtrl.setRoot('SubmitReportBPage', {
			'card_index': 0
		});
	}

	public open(event, item: IndicatorView) {
		this.history.addHistory(this.view);
		this.local.setLocalIndicators(this.indicators);
		this.navCtrl.setRoot('SubmitReportBPage', {
			'card_index': item.index
		});
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

	setAlertStyle(state) {
		if (state.endsWith('late')) {
			let styles = {
				'color': '#EA6288',
				'font-weight': 'bold'
			};
			return styles;
		} else {
			let styles = {
				'color': 'black'
			};
			return styles;
		}
	}

	handleError(error) {
		console.log(error);
	}

}
