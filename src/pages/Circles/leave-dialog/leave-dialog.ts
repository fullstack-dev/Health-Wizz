import { Component, Renderer } from '@angular/core';
import { IonicPage, ViewController, NavController, NavParams } from 'ionic-angular';
import { LanguageProvider } from '../../../providers/language/language';

/**
 * Generated class for the LeaveDialogPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
	selector: 'page-leave-dialog',
	templateUrl: 'leave-dialog.html',
})
export class LeaveDialogPage {
	circle: any;
	member_item: any;
	where: string = "";
	lang_resource: any;

	constructor(
		public renderer: Renderer,
		public viewCtrl: ViewController,
		public navCtrl: NavController,
		public navParams: NavParams,
		private language_provider: LanguageProvider
	) {
		this.circle = this.navParams.get('circle');
		this.lang_resource = this.language_provider.getLanguageResource();
	}

	ionViewDidLoad() {

		this.where = this.navParams.get('from');
	}

	public cancelClick = () => {
		this.viewCtrl.dismiss("cancel");
		// if(this.where == 'circle'){
		// 	this.navCtrl.setRoot('CirclePage', {circle: this.circle, from: "leave-dialog"});
		// }
		// else if(this.where == 'members'){
		// 	this.navCtrl.setRoot('MembersPage', {circle: this.circle, from: "leave-dialog"});
		// }
		// else if(this.where == 'member-detail'){
		// 	this.navCtrl.setRoot('MemberDetailPage', {circle: this.circle, from: "leave-dialog"})
		// }
		// else {

		// }
	}

	public leaveClick = () => {
		this.viewCtrl.dismiss("leave");
	}

}
