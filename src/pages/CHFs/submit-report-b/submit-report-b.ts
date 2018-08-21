import { Component, ViewChild } from '@angular/core';
import { IonicPage, Platform, NavController, NavParams, Slides, Content, ModalController } from 'ionic-angular';
import { RestDataProvider } from '../../../providers/rest-data-service/rest-data-service';
import { UserService } from '../../../providers/user-service';
import { Helper } from '../../../providers/helper-service';
import { LocalDataProvider } from '../../../providers/local-data/local-data';
import { IndicatorView, Question, MhiUpdate } from '../../../models/classes';
import { HistoryProvider } from '../../../providers/history/history';
import { LanguageProvider } from '../../../providers/language/language';
import { ValidatorProvider } from '../../../providers/validator/validator';
import { Toast } from '@ionic-native/toast';
import { AbstractControlDirective } from '@angular/forms';
import { Keyboard } from '@ionic-native/keyboard';
@IonicPage()
@Component({
	selector: 'page-submit-report-b',
	templateUrl: 'submit-report-b.html',
})

export class SubmitReportBPage {
	view = 'SubmitReportBPage';
	validator = new ValidatorProvider();
	indicators: Array<IndicatorView>;
	data_date: Date;
	padding: boolean = false;
	lang_resource: any;
	// pattern_validator: RegExp = /^[0-9]+$/;
	// prevView: string;
	@ViewChild(Slides) slides: Slides;
	@ViewChild(Content) content: Content;

	updates: Array<any>;
	temp_updates: Array<any>;
	indicatorsToUpdate: Array<IndicatorView>;
	show_pager = true;

	constructor(
		public platform: Platform,
		public navCtrl: NavController,
		public navParams: NavParams,
		public restService: RestDataProvider,
		public userService: UserService,
		public helper: Helper,
		public local: LocalDataProvider,
		private history: HistoryProvider,
		private language_provider: LanguageProvider,
		private modalCtrl: ModalController,
		private toast: Toast,
		private keyboard: Keyboard
	) {
		this.updates = new Array();
		this.temp_updates = new Array();
		this.lang_resource = this.language_provider.getLanguageResource();
		this.data_date = this.navParams.get('data_date');
		if (!this.data_date) {
			this.data_date = new Date();
		}
	}

	ionViewDidLoad() {
		this.indicators = this.local.getLocalIndicators();
		let index = this.navParams.get('card_index');
		setTimeout(() => {
			if (index) {
				this.slides.slideTo(index, 300);
			} else {
				this.slides.slideTo(0, 300);
			}
		}, 300);

		this.keyboard.onKeyboardShow().subscribe(r => {
			this.show_pager = false;
		});

		this.keyboard.onKeyboardHide().subscribe(r => {
			this.show_pager = true;
		});
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

	public getAnswer(value: string) {
		if (value == "VERY MUCH") {
			return "A Lot";
		}
		return value;
	}

	public Done = () => {
		this.indicatorsToUpdate = new Array();
		if (this.updates.length > 0) {
			let save_title = 'Save changes?';
			let save_message = 'You have made changes to your index cards. Would you like to save these changes??';
			let save_pos_text = 'Save';
			let save_neg_text = "Don't save";
			let save_confirm = this.modalCtrl.create('ConfirmPopupPage', { 'title': save_title, 'message': save_message, 'pos_text': save_pos_text, 'neg_text': save_neg_text }, { enableBackdropDismiss: true });
			save_confirm.onDidDismiss(save_res => {
				if (save_res == true) {
					this.indicators.forEach(indicator => {
						this.updates.forEach(code => {
							if (indicator.data.indicatorCode == code) {
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
										return e == indicator.data.indicatorCode;
									});

									if (!found) {
										nonEmpty.push(indicator);
									}
								});
								this.indicatorsToUpdate = nonEmpty;
								this.updateMhi2(0);
							}
						});
						empty_confirm.present();
					} else if (emptyCards.length >= this.indicatorsToUpdate.length) {
						this.toast.show("All modified index card doesn't have valid values.", "3000", "bottom").subscribe(r1 => { });
					} else if (emptyCards.length == 0) {
						this.updateMhi2(0);
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

		// old
		// let allValuePresent = true;
		// this.indicators.forEach(indicator => {
		// 	if (indicator.data.indicatorCode != "Appointment") {
		// 		if (indicator.newValue == null || indicator.newValue == undefined || indicator.newValue == "") {
		// 			allValuePresent = false;
		// 		}
		// 	}
		// });
		// if (allValuePresent != true) {
		// 	this.helper.showAlert("Please provide data for all indexes.", "Missing data!");
		// 	return;
		// }
		// this.helper.showLoading(); //loader start-1
		// this.updateMhi2(0);
	}

	public checkEmpty(): Array<any> {

		let empty = [];
		this.indicatorsToUpdate.forEach(indicator => {
			// if (indicator.data.questions != null) {
			// 	indicator.data.questions.forEach(question => {
			if ((indicator.data.indicatorCode != "Appointment") && (indicator.newValue == null || indicator.newValue == undefined)) {
				empty.push(indicator.data.indicatorCode);
			} else {
				if (indicator.inputType == 'value' && !(this.validator.indicator_validator.value_pattern).test(indicator.newValue)) {
					empty.push(indicator.data.indicatorCode);
				}
			}

			// 	});
			// }
		});
		return empty;
	}

	public updateMhi2(index) {
		let i = index;
		if (i < this.indicatorsToUpdate.length) {
			this.updateMhi(this.indicatorsToUpdate[i])
				.then(r => {
					let i2 = i + 1;
					this.updateMhi2(i2);
				}).catch(e => {
					this.helper.hideLoading(); //loader end-1
					// this.helper.showAlert('Failed to update data ' + this.indicatorsToUpdate[i].data.indicatorCode + '. Try again.', 'Failed!');
					this.toast.show("Failed to update indexes. Try again!", "1500", "bottom").subscribe(r4 => { });

					console.error(e);
				});
		} else if (i == this.indicatorsToUpdate.length) {
			this.helper.hideLoading(); //loader end-1
			// this.updateLedger("all").then(r => {

			// }).catch(e => {

			// });
			this.toast.show("Indexes are updated.", "1500", "bottom").subscribe(r3 => { });
			this.navCtrl.setRoot(this.history.getHistory());
		}
	}

	public updateIndicatorInfo(indicator: IndicatorView) {
		// this.updates = [];

		if (this.updates && this.updates.length > 0) {
			let i = this.updates.findIndex(v => {
				return v == indicator.data.indicatorCode;
			});
			if (i > -1) {
				this.updates.splice(i, 1);
			}
		}

		let invalid = false;

		if ((indicator.data.indicatorCode != "Appointment") && (indicator.newValue == null || indicator.newValue == undefined)) {
			invalid = true;
		} else {
			if (indicator.inputType == 'value' && !(this.validator.indicator_validator.value_pattern).test(indicator.newValue)) {
				invalid = true;
			}
		}

		if (invalid) {
			this.helper.showAlert("Invalid data!", "");
			return;
		}

		this.helper.showLoading();
		this.updateMhi(indicator)
			.then(r => {
				indicator.data.lastUpdatedDate = new Date();
				this.helper.hideLoading();
				this.toast.showShortBottom(indicator.data.indicatorCode + " data updated!").subscribe(r1 => { });
				// this.slides.slideNext();
			}).catch(e => {
				this.helper.hideLoading();
				this.toast.showShortBottom("Error! Try again.").subscribe(r2 => { });
			});

	}

	public updateMhi(indicator: IndicatorView) {
		return new Promise((resolve, reject) => {
			let userId = this.userService.getUserId();
			let question = new Question(indicator.data.questions[0].code, indicator.newValue, indicator.data.questions[0].unit)
			let data = new MhiUpdate(userId, { code: indicator.data.indicatorCode }, [question]);
			this.restService.saveMhi(data)
				.subscribe(result => {
					this.local.updateIndicators(indicator);
					// this.updateLedger(indicator.data.indicatorCode)
					// 	.then(r => {
					// 		resolve(result);
					// 	}).catch(e => {
					// 		reject(e);
					// 	});
					resolve(result);
				}, error => {
					reject(error);
				});
		});
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

	public goToConnectedDevice(index_code) {
		this.navCtrl.push('ConnectedDevicePage', { 'index_code': index_code });
	}

	public goToConnectedDeviceFromBMI = () => {
		this.navCtrl.setRoot('ConnectedDevicePage', { from: 'chf' });
	}

	public goToConnectedDeviceFromBreath = () => {
		this.navCtrl.setRoot('ConnectedDevicePage', { from: 'chf' });
	}

	public goToConnectedDeviceFromPulse = () => {
		this.navCtrl.setRoot('ConnectedDevicePage', { from: 'chf' });
	}

	public goToConnectedDeviceFromOxygen = () => {
		this.navCtrl.setRoot('ConnectedDevicePage', { from: 'chf' });
	}

	public goToDetail(indicator_view: IndicatorView) {
		if (indicator_view.data.indicatorCode == 'Appointment') {
			return;
		}

		this.history.addHistory(this.view);
		this.navCtrl.setRoot('DetailBPage', { 'indicator_view': indicator_view });
	}

	public goToFindPhysician = (indicator_view) => {
		// this.navCtrl.setRoot('FindPhysicianPage', { 'from': 'chf' });
		this.history.addHistory(this.view);
		this.navCtrl.setRoot('DetailBPage', { 'indicator_view': indicator_view });
	}

	handleError(error) {
		console.log(error);
	}

	public setColorStyle(value) {
		if (value == true) {
			return { 'color': '#FB4F84' };
		} else {
			return { 'color': '#73736F' };
		}
	}

	// setting active button's bottom color in Exercise and Smoking 
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
}
