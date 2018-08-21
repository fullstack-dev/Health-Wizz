import { Component } from '@angular/core';
import { Platform, IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';

import { Rest } from '../../../providers/rest';
import { RestDataProvider } from '../../../providers/rest-data-service/rest-data-service';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { Participant, MemberRolesInfo, InviteScreenInfo, Invities } from '../../../models/classes';
import { LocalDataProvider } from '../../../providers/local-data/local-data';
import { HistoryProvider } from '../../../providers/history/history';
import { UserService } from '../../../providers/user-service';
import { LanguageProvider } from '../../../providers/language/language';
import { Helper } from '../../../providers/helper-service';
import { Toast } from '@ionic-native/toast';

@IonicPage()
@Component({
	selector: 'page-circle',
	templateUrl: 'circle.html',
})
export class CirclePage {
	view: string = "CirclePage";
	circle: any;
	circle_name: string = '';
	circle_descriptions: string = '';
	members_data: any;
	circle_numberOfMember: string = '';
	campaignData: any;
	config: Object;
	where: string = '';
	invite_flag: boolean = false;
	participants: Array<Participant>;
	userId: string;
	canLeave: boolean;
	canDelete: boolean;
	canInvite: boolean;
	canUpdate: boolean;
	lang_resource: any;
	circlePic: any;
	constructor(
		public platform: Platform,
		public navCtrl: NavController,
		public navParams: NavParams,
		public domSanitizer: DomSanitizer,
		private helper: Helper,
		public rest: Rest,
		public local: LocalDataProvider,
		public restService: RestDataProvider,
		private history: HistoryProvider,
		private modalCtrl: ModalController,
		private userService: UserService,
		private language_provider: LanguageProvider,
		private toast: Toast
	) {
		this.userId = this.userService.getUserId();
		this.lang_resource = this.language_provider.getLanguageResource();
		this.circlePic = "assets/imgs/MenuIcons/Circles@2x.png";
		this.config = {
			scrollbar: '.swiper-scrollbar',
			scrollbarHide: true,
			slidesPerView: 4,
			centeredSlides: true,
			observer: true,
			spaceBetween: -5,
			grabCursor: true,
			onSlideChangeEnd: function (swiper) {
				// that.swipe(swiper);
			}
		};
	}

	ionViewWillEnter() {
		this.loadData();
	}

	loadData() {
		this.helper.showLoading();
		let circle = this.local.getLocalCircle();
		// if (circle.circlePic == null || circle.circlePic == undefined) {
		// 	this.circlePic = "assets/imgs/MenuIcons/Circles@2x.png";
		// } else {
		// 	this.circlePic = "data:image/jpeg;base64," + circle.circlePic;
		// }

		this.getCircle(circle)
			.then(data => {
				this.circle = data;
				this.loadCirclePic();
				this.enableActions();
				this.loadParticipants()
					.then((participants: Array<Participant>) => {
						this.helper.hideLoading();
						this.participants = participants;
					}).catch(e => {
						this.helper.hideLoading();
						this.toast.showShortBottom("Unable to reach the server.");
					});
			});
	}

	loadCirclePic() {
		if (this.circle && (this.circle.circlePic == null || this.circle.circlePic == undefined)) {
			this.circlePic = "assets/imgs/MenuIcons/Circles@2x.png";
		} else {
			this.circlePic = "data:image/jpeg;base64," + this.circle.circlePic;
		}
	}

	private getCircle(circle) {
		return new Promise((resolve, reject) => {
			this.restService.getCircle(circle.id)
				.subscribe(res => {
					resolve(res);
				}, err => {
					this.handleError(err);
				});
		});
	}

	enableActions() {
		// private
		if (this.circle.circleScope == 'private') {
			// owner
			if (this.circle.ownerId == this.userId) {
				this.canUpdate = true;
				this.canInvite = true;
				this.canDelete = true;
				this.canLeave = false;
			} else {
				// member
				this.canUpdate = false;
				this.canInvite = false;
				this.canDelete = false;
				this.canLeave = true;
			}
			// public
		} else if (this.circle.circleScope == 'public') {
			// owner
			if (this.circle.ownerId == this.userId) {
				this.canUpdate = true;
				this.canInvite = true;
				this.canDelete = true;
				this.canLeave = false;
			} else {
				// member
				this.canUpdate = false;
				this.canInvite = true;
				this.canDelete = false;
				this.canLeave = true;
			}
		}

	}

	loadParticipants() {
		return new Promise((resolve, reject) => {
			let _participants = [];
			this.getParticipants(this.circle.id)
				.then((participants: Array<any>) => {
					participants.forEach((member, i, a) => {
						// if (member.invitationState == 'accept') {
						this.getParticipantProfilePic(member)
							.then(avatar => {
								_participants.push(new Participant(member, avatar));
								if (i == a.length - 1) {
									resolve(_participants);
								}
							});
						// } else if (i == a.length - 1) {
						// 	resolve(_participants);
						// }

					});
				}).catch(e => {
					reject(e);
				});
		});
	}

	getParticipants(circleId: string) {
		return new Promise((resolve, reject) => {
			this.restService.getParticipants(circleId)
				.subscribe((result: any) => {
					resolve(result.info);
				}, err => {
					reject(err);
				});
		});
	}

	getParticipantProfilePic(member: any) {
		return new Promise((resolve) => {
			this.restService.getProfilePic(member.memberId)
				.subscribe(pic => {
					let imagePath: SafeResourceUrl;
					imagePath = this.domSanitizer.bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + pic.image);
					resolve(imagePath);
				}, err => {
					try {
						if (member.gender == "male") {
							resolve(new Participant(member, "assets/imgs/HomeIcons/avatar_male_middle_01.png"));
						} else {
							resolve(new Participant(member, "assets/imgs/HomeIcons/avatar_female_middle_01.png"));
						}
					} catch (e) { }
				});
		});
	}

	// swipe(swiper) {
	//    console.log(swiper);
	// }

	// getCampaigns() {
	//     this.rest.getCampaigns()
	//        .subscribe(
	//            data => {
	//             this.campaignData  = data;
	//             this.avatars = this.campaignData.avatars;
	//             if(this.avatars.length){
	//             	this.avatarsMemebers = this.avatars.length
	//             }
	//         },
	//         error =>  {
	//             this.errorMessage = <any>error;
	//         });
	// }

	public Before = () => {
		// FIXME: go to home if single circle delete or leave
		this.navCtrl.setRoot('MyCirclesPage');
	}

	public Share = () => {

	}

	public Edit = () => {
		// this.history.addHistory(this.view);
		// this.navCtrl.setRoot('CreateCirclePage', { status: "update" });
		let createModal = this.modalCtrl.create('CreateCirclePage', { 'status': "update", 'circle': this.circle }, { cssClass: "circle-create-modal" });
		createModal.onDidDismiss(data => {
			if (data == true) {
				this.loadData();
			}
		});
		createModal.present();
	}

	public goToLeave = () => {
		let leaveCircleModal = this.modalCtrl.create('LeaveDialogPage', { circle: this.circle });
		leaveCircleModal.onDidDismiss(data => {
			if (data == "leave") {
				this.leaveCircle();
			}
		});
		leaveCircleModal.present();
		// this.navCtrl.setRoot('LeaveDialogPage', { circle: this.circle, from: "circle" });
	}

	private leaveCircle() {
		this.restService.leaveCircle(this.circle.id)
			.subscribe(res => {
				this.local.deleteCircle(this.circle.id);
				this.navCtrl.setRoot('MyCirclesPage');
			}, this.handleError)
	}

	public goToDelete = () => {
		let deleteCircleModal = this.modalCtrl.create('DeleteDialogPage', { 'label': this.circle.name, 'type': 'circle' });
		deleteCircleModal.onDidDismiss(data => {
			if (data == "delete") {
				this.deleteCircle();
			}
		});
		deleteCircleModal.present();
	}

	private deleteCircle() {
		this.restService.deleteCircle(this.circle.id)
			.subscribe(res => {
				this.local.deleteCircle(this.circle.id);
				this.navCtrl.setRoot('MyCirclesPage');
			}, this.handleError)
	}

	public acceptInvite() {
		this.restService.accpetDenyCircle(this.circle.id, 'accept')
			.subscribe(res => {
				this.getCircles()
					.then((data: Array<any>) => {
						this.local.setLocalCircles(data);
						this.navCtrl.setRoot('MyCirclesPage');
					});
			}, err => {
				this.handleError(err);
			});
	}

	public denyInvite() {
		this.restService.accpetDenyCircle(this.circle.id, 'deny')
			.subscribe(res => {
				this.getCircles()
					.then((data: Array<any>) => {
						this.local.setLocalCircles(data);
						this.navCtrl.setRoot('MyCirclesPage');
					});
			}, err => {
				this.handleError(err);
			});
	}

	public goToInvite = () => {
		if (!this.participants) {
			return false;
		}
		// this.history.addHistory(this.view);
		let memberRoles: MemberRolesInfo = new MemberRolesInfo(false, false, true);
		let screen_info: InviteScreenInfo = new InviteScreenInfo('circle', this.circle.id, memberRoles, 'send', new Invities([], []), false);
		this.navCtrl.push('InvitePeoplePage', { 'invite_screen_info': screen_info });
	}

	public goToAllMembers = () => {
		this.local.setLocalParticipants(this.participants);
		this.navCtrl.setRoot('MembersPage');
	}

	// Go To Campaign Page with parameter "Circle Name" and "Circle Descriptions".
	public goToAllCampaingns = () => {
		this.navCtrl.setRoot('CampaignPage', { circle: this.circle, from: "circle" });
	}

	public swiper_click(item) {
		this.history.addHistory(this.view);
		this.navCtrl.setRoot('MemberDetailPage', { circle: this.circle, member_item: item });
	}

	public getCircles() {
		return new Promise((resolve, reject) => {
			this.restService
				.getCircles()
				.subscribe(data => {
					resolve(data.info);
				}, error => {
					this.handleError(error);
				});
		});
	}

	handleError(err) {
		console.log(err);
	}

}
