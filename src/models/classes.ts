
// usable only for Chronic disease (CHF indicators)
export class IndicatorView {
    constructor(
        public index: number,
        public detail: string,
        public showTitle: string,
        public inputType: string,
        public data: any,
        public image: string,
        public state: string,
        public newValue: any // only use for update
    ) { }
}

export class HealthIndexIndicator {
    constructor(
        public index: number,
        public href: string,
        public detail: string,
        public detail_red: string,
        public detail_yellow: string,
        public code: string,
        public label: string,
        public image: string,
        public state: string,
        public lastValue: any,
        public questions: Array<HealthIndexQuestion>
    ) { }
}

export class HealthIndexQuestion {
    constructor(
        public type: string,
        public label: string,
        public code: string,
        public value: any,
        public unit: string,
        public units: Array<string>,
        public values: Array<any>
    ) { }
}
export class IndicatorModel {
    constructor(
        public info: HealthIndexIndicator,
        public data: any,
    ) { }
}

export class CDView {
    constructor(
        public data: any,
        public info: any
    ) { }
}

export class MhiUpdate {
    constructor(
        public userId: string,
        public indicator: { code: string },
        public questions: Array<Question>
    ) { }
}

export class IndicatorValidate {
    constructor(
        public id: string,
        public refUser: string,
        public refChallenge: string,
        public code: string,
        public value: any,
        public validatedBy: string,
        public isValidate: boolean,
        public validatedOn: any,
        public updatedOn: any
    ) { }
}

export class RewardIndicatorResult {
    constructor(
        public indicatorInfo: HealthIndexIndicator,
        public indicatorReport: IndicatorValidate[]
    ) { }
}

export class Question {
    constructor(
        public code: string,
        public value: string,
        public unit: string
    ) { }
}

export class MenuData {
    constructor(
        public chronicDiseases: Array<any>,
        public profilePic: any,
        public circles: Array<any>,
        public campaigns: Array<any>,
        public composite_score: any
    ) { }
}

export class InviteContact {
    constructor(
        public name: string,
        public email: string,
        public phone: string,
        public selected: boolean
    ) { }
}

export class TempInviteData {
    constructor(
        public name: string,
        public invite_data: InviteData
    ) { }
}

export class InviteData {
    constructor(
        public email: string,
        public phone: string,
        public memberRoles: MemberRolesInfo
    ) { }
}

export class InviteScreenInfo {
    constructor(
        public item_type: string,
        public item_id: string,
        public memberRoles: MemberRolesInfo,
        public action: string,
        public invities: Invities,
        public published: boolean
    ) { }
}

export class Invities {
    constructor(
        public moderators: Array<InviteContact>,
        public validators: Array<InviteContact>
    ) { }
}

export class MemberRolesInfo {
    constructor(
        public moderator: boolean,
        public validator: boolean,
        public participant: boolean
    ) { }
}

export class ChronicDisease {
    constructor(
        public template: any,
        public campaigns: Array<any>
    ) { }
}

export class Report {
    constructor(
        public date: string,
        public report: Array<any>
    ) { }
}

export class CampaignCategory {
    constructor(
        public name: string,
        public data: Array<any>
    ) { }
}

export class CampaignTemplate {
    constructor(
        public template: string,
        public data: Array<TemplateData>
    ) { }
}

export class TemplateData {
    constructor(
        public code: string,
        public image: string
    ) { }
}

// export class CircleCategory {
//     constructor(
//         public name: string,
//         public data: Array<any>
//     ) { }
// }

export class CircleLeaveData {
    constructor(
        public id: string,
        public invitationState: string //left
    ) { }
}

export class CircleData {
    constructor(
        public name: string,
        public description: string,
        public circleScope: string,
        public invitationState: string,
        public circlePic: any
    ) { }
}

export class CampaignDraft {
    constructor(
        public id: number,
        public campaign: CampaignData,
        public invities: Invities,
        public terms: Array<any>,
        public rewards: any,
        public survey: CampaignSurvey
    ) { }
}

export class CampaignData {

    constructor(
        public name: string,
        public startDate: string,
        public endDate: string,
        public description: string,
        public challengeScope: string,
        public challengeType: ChallengeTypeData,
        public challengeTemplateInfo: ChallengeTemplateInfoData,
        // public campaignInfo: CampaignInfo,
        public termsInfo: string[],
        public campaignInfo: CampaignInfo
    ) { }
}

export class CampaignSettings {
    constructor(
        public id: string,
        public href: string,
        public ageForModerator: boolean,
        public locationForModerator: boolean,
        public campaignForModerator: boolean,
        public circleForModerator: boolean,
        public ageForParticipants: boolean,
        public locationForParticipants: boolean,
        public campaignForParticipants: boolean,
        public circleForParticipants: boolean
    ) { }
}

export class PersonalSettings {
    constructor(
        public href: string,
        public id: string,
        public age: boolean,
        public location: boolean,
        public campaign: boolean,
        public circle: boolean,
        public healthIndex: boolean
    ) { }
}
export class CampaignAcceptDeny {
    constructor(
        public id: string,
        public moderator: boolean,
        public validator: boolean,
        public participant: boolean,
        public campaignInfo: {
            'circleInfo': {
                'invitationState': string
            }
        }
    ) { }
}

export class CampaignInfo {
    constructor(
        public fundedBy: FundSourceInfo[]
    ) {

    }
}

export class FundSourceInfo {
    constructor(
        public sourceType: string,
        public participantFee: number,
        public sponsorName: string
    ) {

    }
}
export class CircleAcceptDeny {
    constructor(
        public id: any,
        public invitationState: string
    ) { }
}

export class ChallengeTypeData {

    constructor(
        public name: string,
        public description: string
    ) { }
}

export class ChallengeTemplateInfoData {
    constructor(
        public name: string,
        public description: string,
        public challengeTemplateType: string,
        public indicatorLst: Array<IndicatorData>,
    ) { }
}

export class RewardsData {
    constructor(
        public id: number,
        public name: string,
        public amount: number,
        public percentage: any,
        public state: string,
        public quantity: number,
        public recipient: any
    ) {

    }
}

export class IndicatorData {

    constructor(
        public code: string,
        public isCalculable: boolean,
        public frequency: string
    ) { }
}
export class CDIndicator {
    constructor(
        public index: number,
        public detail: string,
        public code: string,
        public inputType: string,
        public showTitle: string,
        public image: string
    ) { }
}

export class Participant {
    constructor(
        public info: any,
        public avatar: any
    ) { }
}

export class Language {
    constructor(
        public code: string,
        public type: string,
        public res_url: string
    ) { }
}

export class Device {
    constructor(
        public name: string,
        public connected: boolean
    ) { }
}

export class CampaignSurvey {
    constructor(
        public href: string,
        public id: string,
        public createdBy: string,
        public surveyQuestionInfo: Array<SurveyQuestionInfo>,
        public description: string,
        public userResponseId: string,
        public validated: boolean
    ) { }
}

export class SurveyQuestionInfo {
    constructor(
        public id: string,
        public question: string,
        public frequency: string,
        public answerType: string,
        public surveyAnswerInfo: Array<SurveyAnswerInfo>,
        public responseAnswer: SurveyAnswerReportInfo
    ) { }
}

export class SurveyAnswerReportInfo {
    constructor(
        public id: string,
        public answerId: string,
        public value: string,
        public submitReportDate: any,
        public validated: boolean,
        public validatedBy: string,
        public validatedOn: any
    ) { }
}

export class SurveyAnswerInfo {
    constructor(
        public id: string,
        public answer: string
    ) { }
}

export class IndicatorFrequency {
    constructor(
        public indicatorCode: string,
        public count: number,
        public timespan: string
    ) { }
}

export class Contry {
    constructor(
        public name: string,
        public code: string,
        public states: string[]
    ) { }
}

export class UserSettings {
    constructor(
        public href: string,
        public id: string,
        public age: boolean,
        public location: boolean,
        public campaign: boolean,
        public circle: boolean,
        public healthIndex: boolean
    ) { }
}

export class InviteCodeResponse {
    constructor(
        public id: string,
        public refChallenge: string,
        public refCircle: string,
        public email: string,
        public cell: string,
        public validator: boolean,
        public moderator: boolean
    ) { }
}

export class WalletInfo {
    constructor(
        public id: string,
        public primaryAddress: string,
        public balance: number
    ) { }
}

export class LedgerInfo {
    constructor(
        public href: string,
        public id: string,
        public description: string,
        public transactionDate: string,
        public amount: number,
        public transactionId: string,
        public transactionType: string,
        public txHash: string
    ) { }
}