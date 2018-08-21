import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, AlertController, ModalController } from 'ionic-angular';
import { Rest } from '../../../providers/rest';
import { IndicatorModel, HealthIndexQuestion, Question, MhiUpdate, CampaignSurvey, SurveyQuestionInfo, SurveyAnswerReportInfo, IndicatorFrequency } from '../../../models/classes';
import { LocalDataProvider } from '../../../providers/local-data/local-data';
import { UserService } from '../../../providers/user-service';
import { RestDataProvider } from '../../../providers/rest-data-service/rest-data-service';
import { Helper } from '../../../providers/helper-service';
import { HistoryProvider } from '../../../providers/history/history';
import { ValidatorProvider } from '../../../providers/validator/validator';
import { Toast } from '@ionic-native/toast';
import { AbstractControlDirective } from '@angular/forms';
import { Keyboard } from '@ionic-native/keyboard';

@IonicPage()
@Component({
	selector: 'page-submit-report',
	templateUrl: 'submit-report.html',
})
export class SubmitReportPage {
	campaign: any;
	validator = new ValidatorProvider();
	view: string = 'SubmitReportPage';
	today: string;
	// status: string;
	// pattern_validator: RegExp = /^[0-9]+$/;

	@ViewChild(Slides) slides: Slides;

	weight: string;
	height: string;
	waist: string;
	systolic_b_pressure: string;
	diastolic_b_pressure: string;
	total_cholesterol: string;
	hdl_cholesterol: string;

	indicators: Array<IndicatorModel>;
	indicatorsToUpdate: Array<IndicatorModel>;
	custom_indexes: boolean;
	weight_data: any;
	updates: Array<any>;
	temp_updates: Array<any>;
	campaign_survey: CampaignSurvey;
	survey_last_update: any;
	has_survey: boolean;
	sleep_questions: Array<any>;

	campaign_index_frequencies: IndicatorFrequency[];
	show_pager = true;
	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public alertCtrl: AlertController,
		public rest: Rest,
		public local: LocalDataProvider,
		private userService: UserService,
		private restService: RestDataProvider,
		private helper: Helper,
		private history: HistoryProvider,
		private modalCtrl: ModalController,
		private toast: Toast,
		private keyboard: Keyboard
	) {
		this.updates = new Array();
		this.temp_updates = new Array();
		// this.status = navParams.get('status');
		this.weight_data = local.getWeight();
	}

	ionViewDidLoad() {
		this.custom_indexes = this.navParams.get('custom');
		this.campaign = this.local.getLocalCampaign();

		this.keyboard.onKeyboardShow().subscribe(r => {
			this.show_pager = false;
		});

		this.keyboard.onKeyboardHide().subscribe(r => {
			this.show_pager = true;
		});

		if (this.custom_indexes == true) {
			let indicators = this.local.localCustomIndexes;
			if (indicators.length > 0) {
				this.indicators = indicators;
				this.updateFrequecies();
			} else {
				this.indicators = [];
			}

			if (this.campaign.participant == true) {
				this.getCampaignSurvey();
			} else {
				this.has_survey = false;
			}
		} else {
			this.indicators = this.local.localIndexes;
		}
		let index = this.navParams.get('card_index');
		if (index) {
			setTimeout(() => {
				this.slides.slideTo(index, 300);
			}, 300);
		}
		this.today = Date.now().toString();
	}

	getCampaignSurvey() {
		if (this.campaign) {
			this.restService.getSurvey(this.campaign.id)
				.subscribe(res => {
					console.log(res);
					let srcSurvey: CampaignSurvey = res;
					this.mapSurvey(srcSurvey);
				}, err => {
					this.has_survey = false;
					console.log(err);
				});
		}
	}

	mapSurvey(srcSurvey: CampaignSurvey) {
		try {
			if (srcSurvey) {
				this.has_survey = true;
				srcSurvey.surveyQuestionInfo.forEach(ques => {
					if (!ques.responseAnswer) {
						let ans;
						if (ques.answerType != "MULTIPLE CHOICE") {
							ans = new SurveyAnswerReportInfo(null, ques.surveyAnswerInfo[0].id, null, new Date().getTime(), null, null, null);
						} else {
							ans = new SurveyAnswerReportInfo(null, null, null, new Date().getTime(), null, null, null);
						}
						if (ans) {
							ques.responseAnswer = ans;
						}
						this.survey_last_update = "Update Request!";
					} else {
						this.survey_last_update = srcSurvey.surveyQuestionInfo[0].responseAnswer.submitReportDate;
					}
				});
				this.campaign_survey = srcSurvey;

			} else {
				this.has_survey = false;
			}
		} catch (e) {
			console.warn(e);
		}

	}

	updateFrequecies() {
		let campaign_freqs = this.getFrequencies(this.campaign.challengeTemplateInfo.indicatorLst);
		if (campaign_freqs) {
			this.indicators.forEach(indicator => {
				let state = this.helper.getTimeDifference(indicator.data.lastUpdatedDate, indicator.info.code, campaign_freqs);
				if (state.includes('late')) {
					indicator.data.updateRequire = true;
				}
			});
		}
	}

	// "indicatorLst": [
	// 	{
	// 	  "code": "Alcohol",
	// 	  "isCalculable": true,
	// 	  "frequency": "Daily"
	// 	}
	//   ]

	getFrequencies(campaign_indicator_list: any[]): IndicatorFrequency[] {
		let campaign_index_frequencies = new Array<IndicatorFrequency>();
		campaign_indicator_list.forEach(indicator => {
			let indicator_freq = this.mapFrequency(indicator.frequency, indicator.code);
			if (indicator_freq) {
				campaign_index_frequencies.push(indicator_freq);
			}
		});
		return campaign_index_frequencies;
	}

	// Daily
	// Weekly
	// Every two weeks
	// Monthly
	// Once in a lifetime

	mapFrequency(freq_string: string, indicator_code: string): IndicatorFrequency {
		let indicator_freq: IndicatorFrequency;
		switch (freq_string) {
			case 'Daily':
				indicator_freq = new IndicatorFrequency(indicator_code, 24, 'hour');
				break;
			case 'Weekly':
				indicator_freq = new IndicatorFrequency(indicator_code, 7, 'day');
				break;
			case 'Every two weeks':
				indicator_freq = new IndicatorFrequency(indicator_code, 14, 'day');
				break;
			case 'Monthly':
				indicator_freq = new IndicatorFrequency(indicator_code, 30, 'day');
				break;
			case 'Once in a lifetime':
				indicator_freq = new IndicatorFrequency(indicator_code, 999, 'year');
				break;
			default:
				break;
		}
		return indicator_freq;
	}

	getUnit(unit) {
		if (unit == 'lb') {
			return 'lbs';
		}
		return unit;
	}

	updateSurvey() {
		let flag = false;
		this.campaign_survey.surveyQuestionInfo.forEach(question => {
			if (!question.responseAnswer.value || question.responseAnswer.value == "") {
				flag = true;
			}
		});
		if (flag) {
			this.toast.showLongBottom("Please answer all survey questions.").subscribe(r => { });
			return;
		}
		this.helper.showLoading();
		this.restService.updateSurvey(this.campaign.id, this.campaign_survey)
			.subscribe(res => {
				// console.log(res);
				this.helper.hideLoading();
				this.survey_last_update = new Date();
				this.toast.showShortBottom('Survey report submitted.').subscribe(r => { });
			}, err => {
				console.log(err);
				this.helper.hideLoading();
				this.toast.showShortBottom('Some error in submitting report.').subscribe(r => { });
			});
	}

	showCheckboxes(question: HealthIndexQuestion, indicatorIndex: number, questionIndex: number) {
		let alert = this.alertCtrl.create();
		alert.setTitle(question.label);

		question.values.forEach(item => {
			let checked = false;
			if (question.value == item.code) {
				checked = true;
			}
			alert.addInput({
				type: 'radio',
				label: item.label,
				value: item.code,
				checked: checked
			});
		});

		alert.addButton('Cancel');
		alert.addButton({
			text: 'Ok',
			handler: data => {
				this.indicatorUpdated(this.indicators[indicatorIndex].info.code);
				this.indicators[indicatorIndex].info.questions[questionIndex].value = data;
			}
		});
		alert.present();
	}

	unitChange(indicatorIndex, unit) {
		if (unit == "kg") {
			this.goToKg(indicatorIndex, unit);
		} else {
			this.goToLb(indicatorIndex, unit);
		}

	}
	formatValue(value) {
		return parseFloat(value).toFixed(2);
	}

	goToLb(indicatorIndex, unit) {
		this.indicators[indicatorIndex].info.questions[0].value = (this.indicators[indicatorIndex].info.questions[0].value * 2.20462).toFixed(2);
	}

	goToKg(indicatorIndex, unit) {
		this.indicators[indicatorIndex].info.questions[0].value = (this.indicators[indicatorIndex].info.questions[0].value / 2.20462).toFixed(2);
	}
	heightChange(indicatorIndex, unit) {
		if (unit == "in") {
			this.goToInch(indicatorIndex, unit);
		} else {
			this.goToCm(indicatorIndex, unit);
		}
	}
	goToInch(indicatorIndex, unit) {
		this.indicators[indicatorIndex].info.questions[1].value = (this.indicators[indicatorIndex].info.questions[1].value / 2.54).toFixed(2);
	}
	goToCm(indicatorIndex, unit) {
		this.indicators[indicatorIndex].info.questions[1].value = (this.indicators[indicatorIndex].info.questions[1].value * 2.54).toFixed(2);
	}
	waistUnitChange(question) {
		if (question.value && question.value != "") {
			if (question.unit == "in") {
				question.value = (question.value / 2.54).toFixed(2);
			} else {
				question.value = (question.value * 2.54).toFixed(2);
			}
		}
	}
	showSurveyCheckboxes(question: SurveyQuestionInfo, questionIndex: number) {
		let alert = this.alertCtrl.create();
		alert.setTitle(question.question);
		question.surveyAnswerInfo.forEach(item => {
			let checked = false;
			if (question.responseAnswer.value == item.answer) {
				checked = true;
			}
			alert.addInput({
				type: 'radio',
				label: item.answer,
				value: item.answer,
				checked: checked
			});
		});

		alert.addButton('Cancel');
		alert.addButton({
			text: 'Ok',
			handler: data => {
				this.campaign_survey.surveyQuestionInfo[questionIndex].responseAnswer.value = data;
				this.campaign_survey.surveyQuestionInfo[questionIndex].surveyAnswerInfo.forEach(ans => {
					if (data == ans.answer) {
						this.campaign_survey.surveyQuestionInfo[questionIndex].responseAnswer.answerId = ans.id;
					}
				});
			}
		});
		alert.present();
	}

	updateSurveyAnswer(ques_i) {
		let _ans = this.campaign_survey.surveyQuestionInfo[ques_i].responseAnswer.value;
		this.campaign_survey.surveyQuestionInfo[ques_i].surveyAnswerInfo.forEach(ans => {
			if (_ans == ans.answer) {
				this.campaign_survey.surveyQuestionInfo[ques_i].responseAnswer.answerId = ans.id;
			}
		});
	}

	slideChanged() {
		let currentIndex = this.slides.getActiveIndex();
	}

	public Before = () => {
		this.navCtrl.setRoot(this.history.getHistory());
	}

	public isDirty(value: AbstractControlDirective) {
		if (value.dirty && !value.invalid) {
			return true;
		} else {
			return false;
		}
	}

	public isErrored(value: AbstractControlDirective) {
		if ((value.hasError('required') || value.hasError('pattern')) && value.touched) {
			return true;
		} else {
			return false;
		}
	}

	public indicatorUpdated(code) {
		let found = this.updates.find(e => {
			return e == code;
		});
		if (!found) {
			this.temp_updates.push(code);
		}
		this.updates = this.temp_updates;
	}

	public Done = () => {
		this.indicatorsToUpdate = new Array();
		if (this.updates.length > 0) {
			let save_title = 'Save changes?';
			let save_message = 'You have made changes to your index cards. Would you like to save these changes?';
			let save_pos_text = 'Save';
			let save_neg_text = "Don't save";
			let save_confirm = this.modalCtrl.create('ConfirmPopupPage', { 'title': save_title, 'message': save_message, 'pos_text': save_pos_text, 'neg_text': save_neg_text }, { enableBackdropDismiss: true });
			save_confirm.onDidDismiss(save_res => {
				if (save_res == true) {
					this.indicators.forEach(indicator => {
						this.updates.forEach(code => {
							if (indicator.info.code == code) {
								this.indicatorsToUpdate.push(indicator);
							}
						});
					});

					let emptyCards = this.checkEmpty();
					if (emptyCards.length != 0 && emptyCards.length < this.indicatorsToUpdate.length) {
						let empty_title = 'Invalid values!';
						let empty_message = 'One or more index cards have invalid data. Modify them or save others?';
						let empty_pos_text = 'Save others';
						let empty_neg_text = 'Modify';
						let empty_confirm = this.modalCtrl.create('ConfirmPopupPage', { 'title': empty_title, 'message': empty_message, 'pos_text': empty_pos_text, 'neg_text': empty_neg_text }, { enableBackdropDismiss: true });
						empty_confirm.onDidDismiss(empty_res => {
							if (empty_res == true) {
								//update non null
								let nonEmpty = [];
								this.indicatorsToUpdate.forEach(indicator => {
									let found = emptyCards.find(e => {
										return e == indicator.info.code;
									});

									if (!found) {
										nonEmpty.push(indicator);
									}
								});
								this.indicatorsToUpdate = nonEmpty;
								this.updateCards();
							}
						});
						empty_confirm.present();
					} else if (emptyCards.length >= this.indicatorsToUpdate.length) {
						this.toast.show("All modified index card doesn't have valid values.", "3000", "bottom").subscribe(r1 => { });
					} else if (emptyCards.length == 0) {
						this.updateCards();
					} else {
						this.toast.show("There is some error in saving your updates", "3000", "bottom").subscribe(r2 => { });
					}
				} else {
					this.updates = [];
					this.navCtrl.setRoot(this.history.getHistory());
				}
			});
			save_confirm.present();
		} else {
			this.navCtrl.setRoot(this.history.getHistory());
		}
	}

	public treatedForHighBp(): any {
		let hypertension = this.indicators.find(item => {
			return item.info.code == "Hypertension";
		});
		let bpQuestion = hypertension.info.questions.find(ques => {
			return ques.code == "TREATED_HIGH_BLOOD_PRESSURE";
		});
		if (bpQuestion) {
			return bpQuestion.value;
		} else {
			return "NO";
		}
	}

	public checkEmpty(): Array<any> {
		this.indicatorsToUpdate.forEach(indicator => {
			if (indicator.info.questions != null) {
				indicator.info.questions.forEach(question => {
					if (question.code == 'MALE_COLLAR' || question.code == 'FEMALE_COLLAR' || question.code == 'TREATED_HIGHBLOOD_PRESSURE' || question.code == 'TREATED_HIGH_BLOOD_PRESSURE' || question.code == 'RELATIVE_WITH_DIABETES' || question.code == 'ETHINICITY_BACKGROUND') {
						if (question.value == null) {
							question.value = "NO";
						}
					}
				});
			}
		});

		let empty = [];
		this.indicatorsToUpdate.forEach(indicator => {
			if (indicator.info.questions != null) {
				indicator.info.questions.forEach(question => {
					if (question.value == null || question.value == undefined) {
						empty.push(indicator.info.code);
					} else {
						if (question.type == 'value' && !(this.validator.indicator_validator.value_pattern).test(question.value)) {
							empty.push(indicator.info.code);
						}
					}

				});
			}
		});
		return empty;
	}

	public updateCards() {
		this.helper.showLoading();
		this.updateAll()
			.then(r => {
				this.helper.hideLoading();
				this.navCtrl.setRoot(this.history.getHistory());
				this.toast.show("Indexes are updated.", "1500", "bottom").subscribe(r3 => { });
			}).catch(e => {
				this.helper.hideLoading();
				this.toast.show("Failed to update indexes. Try again!", "1500", "bottom").subscribe(r4 => { });
			});
	}

	public updateAll() {
		let promises = [];
		this.indicatorsToUpdate.forEach(indicator => {
			if (indicator.info.code != 'Cancer') {
				promises.push(this.updateMhi(indicator, -1));
			}
		});
		return Promise.all(promises);
	}

	public updateIndicatorInfo(indicator: IndicatorModel, i_index: number) {
		// this.indicatorsToUpdate.forEach(indicator => {
		// this.updates = [];
		if (this.updates && this.updates.length > 0) {
			let i = this.updates.findIndex(v => {
				return v == indicator.info.code;
			});
			if (i > -1) {
				this.updates.splice(i, 1);
			}
		}
		if (indicator.info.questions != null) {
			indicator.info.questions.forEach(question => {
				if (question.code == 'RELATIVE_WITH_DIABETES' || question.code == 'ETHINICITY_BACKGROUND') {
					if (question.value == null) {
						question.value = "NO";
					}
				}

				if (question.code == 'TREATED_HIGHBLOOD_PRESSURE') {
					question.value = "NO";
					// let treatedForBp = this.treatedForHighBp();
					// if (treatedForBp == "YES" || treatedForBp == true) {
					// 	question.value = "YES";
					// } else {
					// 	question.value = "NO";
					// }
				}

				if (question.code == 'MALE_COLLAR') {
					question.value = "NO";
					// let gender = this.userService.getProfile().gender;
					// if (gender == "1" || gender == 1) {
					// 	question.value = "YES";
					// } else {
					// 	question.value = "NO";
					// }
				}

				if (question.code == 'FEMALE_COLLAR') {
					question.value = "NO";
					// let gender = this.userService.getProfile().gender;
					// if (gender == "2" || gender == 2) {
					// 	question.value = "YES";
					// } else {
					// 	question.value = "NO";
					// }
				}
			});
		}
		// });

		let invalid = false;
		// this.indicatorsToUpdate.forEach(indicator => {
		if (indicator.info.questions != null) {
			indicator.info.questions.forEach(question => {
				if (question.value == null || question.value == undefined) {
					// empty.push(indicator.info.code);
					invalid = true;
				} else {
					if (question.type == 'value' && !(this.validator.indicator_validator.value_pattern).test(question.value)) {
						// empty.push(indicator.info.code);
						invalid = true;
					}
				}
			});
		}
		// });
		if (invalid) {
			this.helper.showAlert("Invalid data!", "");
			return;
		}

		this.helper.showLoading();
		this.updateMhi(indicator, i_index)
			.then(r => {
				indicator.data.lastUpdatedDate = new Date();
				this.helper.hideLoading();
				this.toast.showShortBottom(indicator.info.code + " data updated!").subscribe(r1 => { });
				// this.slides.slideNext();
			}).catch(e => {
				this.helper.hideLoading();
				this.toast.showShortBottom("Error! Try again.").subscribe(r2 => { });
			});

	}

	public updateMhi(indicator: IndicatorModel, i_index: number) {
		return new Promise((resolve, reject) => {
			let userId = this.userService.getUserId();
			let questions = [];
			let value;
			indicator.info.questions.forEach(question => {
				if (question.value == true) {
					value = "YES";
				} else if (question.value == false) {
					value = "NO";
				} else {
					value = question.value;
				}
				questions.push(new Question(question.code, value, question.unit));
			});

			let data = new MhiUpdate(userId, { code: indicator.data.indicatorCode }, questions);
			this.restService.saveMhi(data)
				.subscribe(result => {
					// this.local.updateIndexes(indicator, this.custom_indexes);
					this.local.refreshMhiData()
						.then(r => {
							if (i_index > -1) {
								this.indicators[i_index] = this.local.refreshMhiIndicator(indicator);
								if (this.custom_indexes) {
									this.updateFrequecies();
								}
							}
							resolve(result);
						}).catch(e => {
							console.log(e);
							resolve(e);
						});
				}, error => {
					console.log(error);
					console.log(data);
					reject(error);
				});
		});
	}

	public getPositionStyle(code) {
		let paddingTop = '0px';
		switch (code) {
			case 'Waist Circumference':
				paddingTop = '16vh';
				break;
			case 'Smoking':
			case 'Exercise':
				paddingTop = '22vh';
				break;
			case 'BMI':
			case 'Hypertension':
			case 'Diabetes':
			case 'Cardio':
				paddingTop = '6vh';
				break;
			default:
				break;
		}
		let styles = {
			'padding-top': paddingTop
		};
		return styles;
	}

	showSleepQuestion(code) {
		let show = true;
		switch (code) {
			case "TREATED_HIGHBLOOD_PRESSURE":
			case "FEMALE_COLLAR":
			case "MALE_COLLAR":
				show = false;
				break;
			default:
				break;
		}
		return show;
	}

	public goToConnectedDevice(index_code) {
		this.navCtrl.push('ConnectedDevicePage', { 'index_code': index_code });
	}

	public goToConnectedDeviceFromHeight = () => {
		console.log("@height: ", this.height);
		this.navCtrl.setRoot('ConnectedDevicePage', { from: 'health-index' });
	}

	public goToConnectedDeviceFromWeight = () => {
		console.log("@weight: ", this.weight);
		this.navCtrl.setRoot('ConnectedDevicePage', { from: 'health-index' });
	}

	public goToConnectedDeviceFromWaist = () => {
		console.log("@waist: ", this.waist);
		this.navCtrl.setRoot('ConnectedDevicePage', { from: 'health-index' });
	}

	public goToConnectedDeviceFromSystolicBPressure() {
		console.log("@systolic_blood_pressure: ", this.systolic_b_pressure);
		this.navCtrl.setRoot('ConnectedDevicePage');
	}

	public goToConnectedDeviceFromDiastolicBPressure() {
		console.log("@diastolic blood pressure: ", this.diastolic_b_pressure);
		this.navCtrl.setRoot('ConnectedDevicePage', { from: 'health-index' });
	}

	public goToConnectedDeviceFromTotalCholesterol() {
		console.log("@Total Cholesterol: ", this.total_cholesterol);
		this.navCtrl.setRoot('ConnectedDevicePage', { from: 'health-index' });
	}

	public goToConnectedDeviceFromHDLCholesterol() {
		console.log("@HDL Cholesterol: ", this.hdl_cholesterol);
		this.navCtrl.setRoot('ConnectedDevicePage', { from: 'health-index' });
	}

	public goToDetail(item, indicatorIndex) {
		this.history.addHistory(this.view);
		this.navCtrl.setRoot('DetailPage', { 'item': item, 'index': indicatorIndex, 'custom': this.custom_indexes });
	}

	public goToCancerReport(indicators, index, indicatorIndex) {
		this.history.addHistory(this.view);
		this.navCtrl.setRoot('CancerReportPage', { 'indicators': indicators, 'card_index': index, 'index': indicatorIndex });
	}

	public openCancerLink() {
		// TODO: link should based on language
		let href = window.open("https://www.cancer.org/cancer.html", '_blank', 'location=yes');
	}

	setMyStyles(item) {
		if (item == 'RED') {
			let styles = {
				'color': '#FB4F84'
			};
			return styles;
		} else if (item == 'GREEN') {
			let styles = {
				'color': '#4BCB99'
			};
			return styles;
		} else if (item == 'YELLOW') {
			let styles = {
				'color': '#FFBC00'
			};
			return styles;
		} else {
			let styles = {
				'color': '#73736F'
			};
			return styles;
		}
	}

	public setColorStyle(value) {
		if (value == true) {
			return { 'color': '#FB4F84' };
		} else {
			return { 'color': '#73736F' };
		}
		// if (value == 'RED' || value == 'NOTAVAILABLE') {
		// 	return { 'color': '#EA6288' };
		// } else if (value == 'YELLOW') {
		// 	return { 'color': '#FDBA45' };
		// } else if (value == 'GREEN') {
		// 	return { 'color': '#6EC59A' };
		// } else {
		// 	return { 'color': 'black' };
		// }
	}

	public setZeroActiveStyle(value) {
		let styles = {
			'border-bottom': value == 'NO EXERCISE' ? '1px solid #FB4F84' : 'none',
			'color': '#FB4F84'
		};
		return styles;
	}

	public setFirstActiveStyle(value) {
		let styles = {
			'border-bottom': value == 'MODERATE' ? '1px solid #FFBC00' : 'none',
			'color': '#FFBC00'
		};
		return styles;
	}

	public setSecondActiveStyle(value) {
		let styles = {
			'border-bottom': value == 'EQUAL MIX' ? '1px solid #4BCB99' : 'none',
			'color': '#4BCB99'
		};
		return styles;
	}

	public setThirdActiveStyle(value) {
		let styles = {
			'border-bottom': value == 'VIGOROUS' ? '1px solid #FFBC00' : 'none',
			'color': '#FFBC00'
		};
		return styles;
	}

	public setYesActiveStyle(value) {
		let styles = {
			'border-bottom': value == 'YES' ? '1px solid #FB4F84' : 'none',
			'color': '#FB4F84'
		};
		return styles;
	}

	public setNoActiveStyle(value) {
		let styles = {
			'border-bottom': value == 'NO' ? '1px solid #4BCB99' : 'none',
			'color': '#4BCB99'
		};
		return styles;
	}

}
