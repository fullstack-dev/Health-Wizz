import { CampaignCategory, InviteScreenInfo, CampaignDraft, CampaignTemplate } from "./classes";

export class CampaignStartPageParams {
    constructor(
        public empty: boolean
    ) { }
}

export class CampaignDuplicatePageParams {
    constructor(
        public active_campaigns: CampaignCategory,
        public history_campaigns: CampaignCategory
    ) { }
}

export class CampaignCreatePageParams {
    constructor(
        public template: CampaignTemplate,
        public campaign: any,
        public edit: boolean,
        public draft_edit: boolean,
        public campaign_draft: CampaignDraft,
        public draft_index: any,
        public duplicate: boolean
    ) { }
}

export class CampaignParticipantsPageParams {
    constructor(
        public campaign: any,
        public ended: boolean
    ) { }
}

export class CampaignNotificationDetailPageParams {
    constructor(
        public campaign: any,
        public ended: boolean,
        public from_invite: boolean
    ) { }
}

export class PopoverContentPageParams {
    constructor(
        public campaign: any,
        public is_draft: boolean
    ) { }
}

export class ManageRolesPageParams {
    constructor(
        public campaign: any
    ) { }
}

export class ValidatePageParams {
    constructor(
        public campaign: any
    ) { }
}

export class RewardPageParams {
    constructor(
        public campaign: any
    ) { }
}

export class CampaignDeletePageParams {
    constructor(
        public campaign: any,
        public campaign_draft: any,
        public is_draft: boolean
    ) { }
}

export class InvitePeoplePageParams {
    constructor(
        public invite_screen_info: InviteScreenInfo
    ) { }
}