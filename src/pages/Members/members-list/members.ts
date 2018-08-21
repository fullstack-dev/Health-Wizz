import { Component } from '@angular/core';
import { IonicPage, Platform, NavController, NavParams, ModalController } from 'ionic-angular';

import { Rest } from '../../../providers/rest';
import { RestDataProvider } from '../../../providers/rest-data-service/rest-data-service';
import { UserService } from '../../../providers/user-service';
import { LocalDataProvider } from '../../../providers/local-data/local-data';
import { Participant } from '../../../models/classes';
import { HistoryProvider } from '../../../providers/history/history';

@IonicPage()
@Component({
	selector: 'page-members',
	templateUrl: 'members.html',
})
export class MembersPage {
	view: string = 'MembersPage';
	circle: any;
	circle_name: '';
	circle_descriptions: '';
	circle_numberOfMember: '';
	participant: any;
	members_data: Array<Participant>;
	userId: any;
	canDeleteMembers: boolean;

	constructor(
		public platform: Platform,
		public navCtrl: NavController,
		public navParams: NavParams,
		public rest: Rest,
		public local: LocalDataProvider,
		private modalCtrl: ModalController,
		private restservice: RestDataProvider,
		public userService: UserService,
		private history: HistoryProvider
	) {
		this.circle = this.local.getLocalCircle();
		this.members_data = this.local.getLocalParticipants();
		this.userId = this.userService.getUserId();
	}

	public Before = () => {
		this.navCtrl.setRoot('CirclePage', { circle: this.circle, from: "members" });
	}

	public Search = () => {

	}

	public Share = () => {

	}

	public goToLeave = () => {
		this.navCtrl.setRoot('LeaveDialogPage', { circle: this.circle, from: "members" });
	}

	public goToInvite = () => {
		this.navCtrl.push('InvitePeoplePage');
	}

	public memberSelect(item) {
		this.history.addHistory(this.view);
		this.navCtrl.setRoot('MemberDetailPage', { circle: this.circle, member_item: item });
	}

	public MemberDelete(memberId, firstName) {
		console.log("delected item: ", memberId);
		let deleteMemberModal = this.modalCtrl.create('DeleteDialogPage', { 'label': firstName, 'type': 'member' });
		deleteMemberModal.onDidDismiss(data => {
			if (data == "delete") {
				this.deleteMember(memberId);
			}
		});
		deleteMemberModal.present();
	}
	deleteMember(memberId) {
		this.restservice.deleteMember(this.circle.id, memberId).
			subscribe(res => {
				console.log(res);
				this.navCtrl.setRoot('CirclePage');
			});

	}

	setMyStyles(item) {
		let styles = {
			'color': item.info.invitationState == 'invite' ? '#B2B2B2' : 'black'
		};
		return styles;
	}

}
