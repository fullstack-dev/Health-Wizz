import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, ViewController, NavParams, Slides } from 'ionic-angular';
import { RestDataProvider } from '../../../providers/rest-data-service/rest-data-service';
import { Participant, CampaignSurvey, IndicatorValidate, HealthIndexIndicator, HealthIndexQuestion } from '../../../models/classes';
import { LocalDataProvider } from '../../../providers/local-data/local-data';
import { Helper } from '../../../providers/helper-service';
import { Toast } from '@ionic-native/toast';
import { UserService } from '../../../providers/user-service';

@IonicPage()
@Component({
	selector: 'page-validate-report',
	templateUrl: 'validate-report.html',
})
export class ValidateReportPage {

	@ViewChild(Slides) slides: Slides;
	value = '';
	changeText(value: string) { this.value = value; }
	page: number;
	docs: any;
	surveyList: any;

	member: Participant;
	campaign: any;
	surveys: Array<CampaignSurvey>;
	// mhi_indicators: Array<any>;
	index_to_validate: Array<any>;
	pending_indicators: IndicatorResult[];
	today: any;
	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public viewCtrl: ViewController,
		private restService: RestDataProvider,
		public local: LocalDataProvider,
		private helper: Helper,
		private toast: Toast
	) {
		this.today = new Date();
		this.page = 0;
		this.docs = ["Danitict_Diana_Medina Addis_oc.doc", "Rport2 oc.doc"];
		this.pending_indicators = [];
		this.surveyList = [{ question: 'Little interest or pleasure in doing thinks', answer: 'Never' },
		{ question: 'Feeling down, depressed, or hopless', answer: 'Often' },
		{ question: 'Having trouble falling asleep, or sleeping to much', answer: '3-5 time a week' },
		{ question: 'Feeling tried or Having little energy', answer: 'Often' },
		{ question: 'Poor appetite or overeating', answer: '3-5 week' }
		];
	}

	ionViewWillLoad() {
		this.campaign = this.navParams.get('campaign');
		this.member = this.navParams.get('member');
		this.helper.showLoading();
		this.loadData()
			.then((data: Array<any>) => {
				// this.mhi_indicators = data[0];
				this.helper.hideLoading();
				try {
					this.surveys = data[0];
					// this.pending_indicators = data[1];
				} catch (e) {
					console.log(e);
					this.toast.showShortBottom("Error in getting data!").subscribe(r => { });
				}
			}).catch(e => {
				this.helper.hideLoading();
				this.toast.showShortBottom("Error in getting data!").subscribe(r => { });
			});
	}

	showSlides() {
		if (!this.surveys && !this.pending_indicators) {
			return false;
		}
		if ((this.surveys && this.surveys.length == 0) && (this.pending_indicators && this.pending_indicators.length == 0)) {
			return false;
		}
		return true;
	}

	public loadData() {
		let promises: Array<Promise<any>> = new Array();
		promises.push(this.getSurvey());
		promises.push(this.getValidateIndexes());
		return Promise.all(promises);
	}

	getSurvey() {
		return new Promise((resolve, reject) => {
			this.restService.getMemberSurvey(this.campaign.id, this.member.info.memberId)
				.subscribe(r => {
					console.log("survey => ", r);
					resolve(r.info);
				}, e => {
					reject(e);
				});
		});
	}
	getValidateIndexes() {
		return new Promise((resolve, reject) => {
			this.restService.getMemberIndexes(this.campaign.id, this.member.info.memberId)
				.subscribe(r => {
					this.pending_indicators = [];
					if (r.indicatorValidate) {
						r.indicatorValidate.forEach(index => {
							index.value = JSON.parse(index.value);
							let mhiIndicator = this.getMhiIndicator(index);
							let mapped_ques = [];
							index.value.questions.forEach(question => {
								mapped_ques.push(this.mapQuestion(mhiIndicator.questions, question));
							});
							index.value.questions = mapped_ques;
							this.pending_indicators.push(new IndicatorResult(mhiIndicator, index));
						});
					}
					resolve(r.indicatorValidate);
				}, e => {
					reject(e);
				});
		});
	}

	validateSurvey(survey: CampaignSurvey, survey_index, validate_flag: boolean) {
		this.helper.showLoading();
		survey.validated = validate_flag;
		this.restService.validateMemberSurvey(this.campaign.id, this.member.info.memberId, survey)
			.subscribe(r => {
				this.helper.hideLoading();
				this.toast.showShortBottom("Survey validated!").subscribe(r1 => { });
				this.surveys.splice(survey_index, 1);
				this.updateSlides();
			}, e => {
				this.helper.hideLoading();
				this.toast.showShortBottom("Failed to validate survey!").subscribe(r1 => { });
			});
	}

	validateIndicator(indicator: IndicatorValidate, indicator_index, validate_flag: boolean) {
		this.helper.showLoading();
		let data = { "id": indicator.id, "isValidate": validate_flag };
		console.log(indicator);
		this.restService.validateMemberIndexes(this.campaign.id, this.member.info.memberId, data)
			.subscribe(r => {
				this.helper.hideLoading();
				this.toast.showShortBottom("Index validated!").subscribe(r1 => { });
				this.pending_indicators.splice(indicator_index, 1);
				this.updateSlides();
			}, e => {
				this.helper.hideLoading();
				this.toast.showShortBottom("Failed to validate index!").subscribe(r1 => { });
			});
	}

	updateSlides() {
		this.slides.update();

	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad SubmitReport3Page');
	}

	slideChanged() {
		this.page = this.slides.getActiveIndex();
		if (this.page == 4) {
			this.page = 3;
		}
		console.log(this.page);
	}

	nextSlide() {
		this.slides.slideTo(this.page + 1, 1000);
	}

	cancel() {
		this.viewCtrl.dismiss({ value: 'cancel' });
	}

	done() {
		this.viewCtrl.dismiss({ value: 'done' });
	}

	mapQuestion(questions: Array<HealthIndexQuestion>, ques: any) {
		let _ques = questions.find(item => {
			return item.code == ques.code;
		});
		if (_ques) {
			_ques.value = this.mapQestionValue(_ques, ques);
			_ques.unit = ques.unit;
		}
		return _ques;
	}

	mapQestionValue(h_ques: HealthIndexQuestion, r_ques) {
		if (h_ques.type == "toggle" || h_ques.type == "check") {
			let value = h_ques.values.find(item => {
				return item.code == r_ques.value;
			});
			if (value) {
				return value.label;
			}
		} else {
			return r_ques.value;
		}
	}

	getMhiIndicator(indicator: IndicatorValidate) {
		let result = this.local.mhiIndicators.find(item => {
			return indicator.code == item.code;
		});
		return result;
	}

}


class IndicatorResult {
	constructor(
		public info: HealthIndexIndicator,
		public indicator: IndicatorValidate
	) { }
}