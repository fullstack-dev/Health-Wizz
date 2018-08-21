import { Component, Renderer } from '@angular/core';
import { IonicPage, ViewController, NavController, NavParams } from 'ionic-angular';
import { LanguageProvider } from '../../../providers/language/language';
@IonicPage()
@Component({
	selector: 'page-delete-dialog',
	templateUrl: 'delete-dialog.html',
})
export class DeleteDialogPage {
	circle: any;
	label: any;
	type: any;
	lang_resource: any;
	constructor(
		public renderer: Renderer,
		public viewCtrl: ViewController,
		public navCtrl: NavController,
		public navParams: NavParams,
		private language_provider: LanguageProvider
	) {
		this.lang_resource = this.language_provider.getLanguageResource();
		this.circle = this.navParams.get('circle');
		let label = navParams.get('label');
		let type = navParams.get('type');
		if (label) {
			this.label = label;
		}
		if (type) {
			this.type = type;
		}
	}

	public cancelClick = () => {
		this.viewCtrl.dismiss('cancel');
	}

	public deleteClick = () => {
		this.viewCtrl.dismiss('delete');
	}

}
