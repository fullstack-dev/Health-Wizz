import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, ModalController, PopoverController, NavParams, Slides } from 'ionic-angular';
import { RestDataProvider } from '../../../providers/rest-data-service/rest-data-service';
import { CampaignCategory, MemberRolesInfo, InviteScreenInfo, Invities, CampaignDraft } from '../../../models/classes';
import { LocalDataProvider } from '../../../providers/local-data/local-data';
import { HistoryProvider } from '../../../providers/history/history';
import { UserService } from '../../../providers/user-service';
import { Storage } from '@ionic/storage';
import { Helper } from '../../../providers/helper-service';
import { ConstProvider } from '../../../providers/const/const';
import {
	CampaignStartPageParams,
	CampaignDuplicatePageParams,
	CampaignCreatePageParams,
	CampaignParticipantsPageParams,
	CampaignNotificationDetailPageParams,
	PopoverContentPageParams,
	ManageRolesPageParams,
	ValidatePageParams,
	RewardPageParams,
	CampaignDeletePageParams,
	InvitePeoplePageParams
} from '../../../models/nav.params';

@IonicPage()
@Component({
	selector: 'page-campaign',
	templateUrl: 'campaign.html',
})
export class CampaignPage {
	@ViewChild('invitesSlides') invite_slides: Slides;
	@ViewChild('activeSlides') active_slides: Slides;
	@ViewChild('historySlides') history_slides: Slides;
	@ViewChild('draftsSlides') drafts_slides: Slides;

	view: string = 'CampaignPage';
	search_bar: boolean;
	search_query: any;
	campaignData: any;
	campaigns: Array<CampaignCategory>;
	userId: any;
	drafts: Array<CampaignDraft>;
	active_campaigns: CampaignCategory;
	invited_campaigns: CampaignCategory;
	history_campaigns: CampaignCategory;

	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public modalCtrl: ModalController,
		public popoverCtrl: PopoverController,
		public restService: RestDataProvider,
		public local: LocalDataProvider,
		private history: HistoryProvider,
		private userService: UserService,
		private storage: Storage,
		private helper: Helper,
		private constants: ConstProvider
	) {
		this.userId = this.userService.getUserId();
	}

	ionViewDidEnter() {
		this.loadCampaigns(false);
	}

	loadCampaigns(slide_last: boolean) {
		this.getCampaignDrafts();
		let initialCampaigns = this.local.getLocalCampaigns();
		let _campaigns = [];

		let invitations = this.local.getInvitedCampaigns(initialCampaigns);
		let actives = this.local.getActiveCampaigns(initialCampaigns);
		let pasts = this.local.getPastCampaigns(initialCampaigns);
		if (invitations) {
			_campaigns.push(new CampaignCategory(this.constants.CAMPAIGN_CATEGORIES.INVITATIONS, invitations));
			this.invited_campaigns = new CampaignCategory(this.constants.CAMPAIGN_CATEGORIES.INVITATIONS, invitations);
		}
		if (actives) {
			_campaigns.push(new CampaignCategory(this.constants.CAMPAIGN_CATEGORIES.CURRENT, actives));
			this.active_campaigns = new CampaignCategory(this.constants.CAMPAIGN_CATEGORIES.CURRENT, actives);
		}
		if (pasts) {
			_campaigns.push(new CampaignCategory(this.constants.CAMPAIGN_CATEGORIES.HISTORY, pasts));
			this.history_campaigns = new CampaignCategory(this.constants.CAMPAIGN_CATEGORIES.HISTORY, pasts);
		}
		this.campaigns = _campaigns;
		setTimeout(() => {
			// if (this.local.slide_campaigns) {
			if (slide_last) {
				this.slides_ref.slideTo(this.active_campaigns.data.length - 1);
			} else if (this.local.campaign_slide_index > -1 && this.local.campaign_slides) {
				let index = this.local.campaign_slide_index;
				if (index > -1) {
					if (this.local.campaign_slides) {
						this.slides_ref.slideTo(index);
					}
				}
			}
			// }
		}, 500);
		// this.setItems();

	}

	get slides_ref() {
		switch (this.local.campaign_slides) {
			case this.constants.CAMPAIGN_CATEGORIES.HISTORY:
				return this.history_slides;
			case this.constants.CAMPAIGN_CATEGORIES.CURRENT:
				return this.active_slides;
			case this.constants.CAMPAIGN_CATEGORIES.INVITATIONS:
				return this.invite_slides;
			case this.constants.CAMPAIGN_CATEGORIES.DRAFT:
				return this.drafts_slides;
			default:
				return null;
		}
	}

	getCampaignDrafts() {
		this.storage.get(this.constants.STORAGE.CAMPAIGN_DRAFTS).then((_drafts: Array<CampaignDraft>) => {
			if (_drafts && _drafts.length && _drafts.length > 0) {
				this.drafts = _drafts;
			} else {
				this.drafts = [];
			}
		}).catch(e => {
			console.error(e);
		});
	}

	emptyCampaigns() {
		if (!this.campaigns) {
			if (!this.drafts) {
				return true;
			} else if (this.drafts.length > 0) {
				return false;
			} else {
				return true;
			}
		} else {
			let empty_flag = true;
			this.campaigns.forEach(category => {
				if (category.data.length > 0) {
					empty_flag = false;
				}
			});
			if (this.drafts && this.drafts.length > 0) {
				empty_flag = false;
			}
			return empty_flag;
		}
		// if ((!this.campaigns) || (this.campaigns && this.campaigns.length == 0)) {
		// 	if ((!this.drafts) || (this.drafts && this.drafts.length == 0)) {
		// 		return true;
		// 	}
		// }
		// if ((this.campaigns && this.campaigns.length > 0) || (this.drafts && this.drafts.length > 0)) {
		// 	return false;
		// }
	}

	formatDateView(date: string) {
		return new Date(date);
	}

	searchCampaign() {
		this.search_query = null;
		this.search_bar = !this.search_bar;
	}

	addCampaign(event) {
		let startModal = this.popoverCtrl.create('CampaignStartPage', new CampaignStartPageParams(this.emptyCampaigns()), { enableBackdropDismiss: true, cssClass: 'campaign-start-popover' });

		startModal.onDidDismiss(data => {
			if (!data) {
				return;
			}
			let id = data.id
			if (id == '0') {
				this.openCampaignCreateModal(null, null, false);
			} else if (id == '1') {
				this.openCampaignDuplicateModal();
			} else if (id == '2') {
				this.openCampaignTemplateModal();
			}
		});

		startModal.present({
			ev: event
		});
	}

	openCampaignTemplateModal() {
		let result_modal = this.modalCtrl.create('CampaignTemplatePage', {}, { cssClass: "campaign-template-modal" });
		result_modal.onDidDismiss(data => {
			if (data) {
				this.openCampaignCreateModal(data, null, false);
			}
		});
		result_modal.present();
	}

	openCampaignDuplicateModal() {
		let result_modal = this.modalCtrl.create('CampaignDuplicatePage', new CampaignDuplicatePageParams(this.active_campaigns, this.history_campaigns), { cssClass: "campaign-duplicate-modal" });
		result_modal.onDidDismiss(data => {
			if (data) {
				this.openCampaignCreateModal(null, data, true);
			}
		});
		result_modal.present();
	}

	openCampaignCreateModal(template, campaign, duplicate: boolean) {
		let createModal = this.modalCtrl.create('CampaignCreatePage', new CampaignCreatePageParams(template, campaign, false, false, null, null, duplicate), { cssClass: "campaign-create-modal" });
		createModal.onDidDismiss(data => {
			this.loadCampaigns(true);
		});
		createModal.present();
	}

	openCampaignEditModal(campaign) {
		let createModal = this.modalCtrl.create('CampaignCreatePage', new CampaignCreatePageParams(null, campaign, true, false, null, null, false), { cssClass: "campaign-create-modal" });
		createModal.onDidDismiss(data => {
			if (data == true) {
				this.loadCampaigns(false);
			}
		});
		createModal.present();
	}

	openCampaignDraftEditModal(campaign_draft, draft_index) {
		let createModal = this.modalCtrl.create('CampaignCreatePage', new CampaignCreatePageParams(null, null, false, true, campaign_draft, draft_index, false), { cssClass: "campaign-create-modal" });
		createModal.onDidDismiss(data => {
			if (data == true) {
				this.loadCampaigns(false);
			}
		});
		createModal.present();
	}

	showCampaignMembers(campaign, category: CampaignCategory) {
		this.local.campaign_slide_index = -1;
		let ended = false;
		if (category.name == this.constants.CAMPAIGN_CATEGORIES.HISTORY) {
			ended = true;
		}
		this.navCtrl.push('CampaignParticipantsPage', new CampaignParticipantsPageParams(campaign, ended));
	}

	before() {
		this.navCtrl.setRoot('HomePage');
	}

	search() {
		this.search_query = null;
		try {
			setTimeout(() => {
				this.active_slides.slideTo(0);
			}, 100);
			setTimeout(() => {
				this.invite_slides.slideTo(0);
			}, 100);
			setTimeout(() => {
				this.history_slides.slideTo(0);
			}, 100);
			setTimeout(() => {
				this.drafts_slides.slideTo(0);
			}, 100);
		} catch (e) {
			console.log(e);
		}
		this.search_bar = !this.search_bar;
	}

	onSearchInput() {
		try {
			setTimeout(() => {
				if (this.active_slides.getActiveIndex() > 0) {
					this.active_slides.slideTo(0);
				}
			}, 100);
			setTimeout(() => {
				if (this.invite_slides.getActiveIndex() > 0) {
					this.invite_slides.slideTo(0);
				}
			}, 100);
			setTimeout(() => {
				if (this.history_slides.getActiveIndex() > 0) {
					this.history_slides.slideTo(0);
				}
			}, 100);
			setTimeout(() => {
				if (this.drafts_slides.getActiveIndex() > 0) {
					this.drafts_slides.slideTo(0);
				}
			}, 100);

		} catch (e) {
			console.log(e);
		}

	}

	Share() {
		console.log('share');
	}

	goDetail(campaign, category: CampaignCategory, slide_index: number) {
		this.history.addHistory(this.view);
		this.local.setLocalCampaign(campaign);
		this.local.campaign_slide_index = slide_index;
		let ended = false;
		if (category.name == this.constants.CAMPAIGN_CATEGORIES.HISTORY) {
			ended = true;
			this.local.campaign_slides = this.constants.CAMPAIGN_CATEGORIES.HISTORY;
		} else {
			this.local.campaign_slides = this.constants.CAMPAIGN_CATEGORIES.CURRENT;
		}
		this.navCtrl.setRoot('CampaignNotificationDetailPage', new CampaignNotificationDetailPageParams(campaign, ended, false));
	}

	accept(_campaign) {
		this.local.setLocalCampaign(_campaign);
		this.navCtrl.push('CampaignNotificationDetailPage', new CampaignNotificationDetailPageParams(null, false, true));
	}

	deny(_campaign, i2) {
		this.helper.showConfirm("Don't want to participate?", "Are you sure to delete the invitation for this campaign?", "Yes", "No")
			.then(y => {
				let is_last = this.invite_slides.isEnd();
				let s_index = this.invite_slides.getActiveIndex();
				this.local.campaign_slide_index = -1;
				let campaign = JSON.parse(JSON.stringify(_campaign));
				campaign.campaignInfo.circleInfo.invitationState = this.constants.INVITE_STATE.DENY;
				this.restService.acceptDenyCampaign(campaign)
					.subscribe(result => {
						this.local.deleteCampaign(_campaign.id).then(r => {
							if (r) {
								this.refrehInvites(is_last, s_index);
							} else {
								// FIXME: failed to delete local copy of campaign ?
								this.refrehInvites(is_last, s_index);
							}
						});
					}, err => {
						console.error(err);
					});
			}).catch(n => { });
	}

	refrehInvites(isLastSlide: boolean, slide_index: number) {
		this.loadCampaigns(false);
		setTimeout(() => {
			if (isLastSlide) {
				this.invite_slides.slideTo(slide_index - 1);
			} else {
				this.invite_slides.slideTo(slide_index);
			}
		}, 500);
	}

	/**
	 * enable or disable details link on every campaign tile.
	 * @param campaign 
	 */
	showDetails(campaign) {
		// FIXME: manage these conditions. 
		if (campaign.moderator || campaign.validator) {
			if (!campaign.moderator && campaign.validator) {
				if (this.CampaignStarted(campaign)) {
					if (campaign.campaignInfo.isPublish) {
						return true;
					} else {
						return false;
					}
				} else {
					return false;
				}
			}
			if (campaign.campaignInfo.isPublish) {
				return true;
			}
			if (campaign.moderator && !campaign.campaignInfo.isPublish) {
				return true;
			}
			if (!campaign.moderator && campaign.validator && !campaign.campaignInfo.isPublish) {
				return false;
			}
		}
		return false;
	}

	CampaignStarted(campaign) {
		let today = new Date().getTime();
		let startDate = new Date(campaign.startDate).getTime();
		if (startDate < today) {
			return true;
		}
		return false;
	}

	selectOptions(event, item, slide_index) {
		this.local.campaign_slide_index = slide_index;
		this.local.campaign_slides = this.constants.CAMPAIGN_CATEGORIES.CURRENT;
		let popover = this.popoverCtrl.create('PopoverContentPage', new PopoverContentPageParams(item, false), { cssClass: 'campaign-role-popover', enableBackdropDismiss: true });
		popover.onDidDismiss((data) => {
			if (data) {
				if (data.value == 0) {
					this.invitePeople(item);
				} else if (data.value == 1) {
					this.navCtrl.push('ManageRolesPage', new ManageRolesPageParams(item));
				} else if (data.value == 2) {
					this.openCampaignEditModal(item);
				} else if (data.value == 3) {
					this.navCtrl.setRoot('ValidatePage', new ValidatePageParams(item));
				} else if (data.value == 4) {
					this.navCtrl.push('RewardPage', new RewardPageParams(item));
				} else if (data.value == 5) {
					this.deleteCampaign(item);
				}
			}
		})
		popover.present({
			ev: event
		});
	}

	selectDraftOptions(draft_index, item) {
		this.local.campaign_slide_index = draft_index;
		this.local.campaign_slides = this.constants.CAMPAIGN_CATEGORIES.DRAFT;
		let popover = this.popoverCtrl.create('PopoverContentPage', new PopoverContentPageParams(item, true), { cssClass: 'campaign-role-popover', enableBackdropDismiss: true });
		popover.onDidDismiss((data) => {
			if (data) {
				if (data.value == 2) {
					this.openCampaignDraftEditModal(item, draft_index);
				} else if (data.value == 5) {
					this.deleteDraftCampaign(item);
				}
			}
		})
		popover.present({
			ev: event
		});
	}

	deleteCampaign(campaign) {
		let deleteModal = this.modalCtrl.create('CampaignDeletePage', new CampaignDeletePageParams(campaign, null, false));
		deleteModal.onDidDismiss(data => {
			if (data == true) {
				this.loadCampaigns(false);
			}
		});
		deleteModal.present();
	}

	deleteDraftCampaign(campaign_draft) {
		let deleteModal = this.modalCtrl.create('CampaignDeletePage', new CampaignDeletePageParams(null, campaign_draft, true));
		deleteModal.onDidDismiss(data => {
			if (data == true) {
				this.loadCampaigns(false);
			}
		});
		deleteModal.present();
	}

	invitePeople(campaign) {
		this.local.campaign_slide_index = -1;
		let memberRoles: MemberRolesInfo = new MemberRolesInfo(false, false, true);
		let screen_info: InviteScreenInfo = new InviteScreenInfo(this.constants.INVITE_INFO.CHALLENGE, campaign.id, memberRoles, this.constants.INVITE_INFO.SEND, new Invities([], []), campaign.campaignInfo.isPublish);
		this.navCtrl.push('InvitePeoplePage', new InvitePeoplePageParams(screen_info));
	}

	public onCancel($event) {
		this.search_bar = !this.search_bar;
	}

	handleError(error) {
		console.log(error);
	}
}
