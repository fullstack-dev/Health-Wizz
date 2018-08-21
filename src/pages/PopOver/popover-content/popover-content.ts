import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController, NavParams, ModalController } from 'ionic-angular';

/**
 * Generated class for the PopoverContentPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
	selector: 'page-popover-content',
	templateUrl: 'popover-content.html',
})
export class PopoverContentPage {
	popover0List: any;
	popover1List: any;
	popover2List: any;
	popover3List: any;
	popover4List: any;
	campaignData: any;
	isDraft: boolean;
	// module: any;
	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public modalCtrl: ModalController,
		public viewCtrl: ViewController

	) {

		this.campaignData = navParams.get('campaign');
		this.isDraft = navParams.get('is_draft');

		// moderator + validator (published)
		this.popover0List = [
			{ id: 0, title: 'Invite People', icon: 'assets/imgs/MenuIcons/_Profille@2x.png' },
			{ id: 1, title: 'Manage Roles', icon: 'assets/imgs/AddMedImgs/Recent@1x.png' },
			{ id: 2, title: 'Edit Campaign', icon: 'assets/imgs/Icons/edit@2x.png' },
			{ id: 3, title: 'Validate Participant', icon: 'assets/imgs/Icons/Group@2x.png' },
			{ id: 4, title: 'Reward Participants', icon: 'assets/imgs/MenuIcons/OmCoin@2x.png' },
			{ id: 5, title: 'Delete Campaign', icon: 'assets/imgs/Icons/trash.png' }
		];

		// moderator (published)
		this.popover1List = [
			{ id: 0, title: 'Invite People', icon: 'assets/imgs/MenuIcons/_Profille@2x.png' },
			{ id: 1, title: 'Manage Roles', icon: 'assets/imgs/AddMedImgs/Recent@1x.png' },
			{ id: 2, title: 'Edit Campaign', icon: 'assets/imgs/Icons/edit@2x.png' },
			{ id: 4, title: 'Reward Participants', icon: 'assets/imgs/MenuIcons/OmCoin@2x.png' },
			{ id: 5, title: 'Delete Campaign', icon: 'assets/imgs/Icons/trash.png' }
		];

		//  validator (published)
		this.popover2List = [
			{ id: 3, title: 'Validate Participant', icon: 'assets/imgs/Icons/Group@2x.png' }
		];

		// draft
		this.popover3List = [
			{ id: 2, title: 'Edit Campaign', icon: 'assets/imgs/Icons/edit@2x.png' },
			{ id: 5, title: 'Delete Campaign', icon: 'assets/imgs/Icons/trash.png' }
		]

		// moderator (unpublished)
		this.popover4List = [
			{ id: 0, title: 'Invite People', icon: 'assets/imgs/MenuIcons/_Profille@2x.png' },
			{ id: 1, title: 'Manage Roles', icon: 'assets/imgs/AddMedImgs/Recent@1x.png' },
			{ id: 2, title: 'Edit Campaign', icon: 'assets/imgs/Icons/edit@2x.png' },
			{ id: 5, title: 'Delete Campaign', icon: 'assets/imgs/Icons/trash.png' }
		]

	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad PopoverContentPage');
	}

	clickEvent(event, id) {
		console.log(id);
		this.viewCtrl.dismiss({ value: id });
	}

	get roles() {
		if (this.isDraft) {
			return this.popover3List;
		}
		if (this.isPublished) {
			// published
			if (this.isStarted) {
				// started
				if (this.isModerator && !this.isValidator) {
					// only moderator
					return this.popover1List;
				} else if (!this.isModerator && this.isValidator) {
					// only validator
					return this.popover2List;
				} else if (this.isModerator && this.isValidator) {
					// both
					return this.popover0List;
				} else {
					// invalid (only participant)
				}
			} else {
				// not started
				if (this.isModerator) {
					return this.popover4List;
				} else {
					// invalid all other
				}
			}
		} else {
			// not published
			if (this.isModerator) {
				return this.popover4List;
			} else {
				// invalid all other
			}
		}
		// return;
	}

	get isModerator() {
		if (this.campaignData.moderator) {
			return true;
		}
		return false;
	}

	get isValidator() {
		if (this.campaignData.validator) {
			return true;
		}
		return false;
	}

	get isPublished() {
		try {
			if (this.campaignData.campaignInfo.isPublish) {
				return true;
			}
			return false;
		} catch (e) {
			return false;
		}
	}

	get isStarted() {
		let today = new Date().getTime();
		let startDate = new Date(this.campaignData.startDate).getTime();
		if (startDate < today) {
			return true;
		}
		return false;
	}
}
