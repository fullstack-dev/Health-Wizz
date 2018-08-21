import { Injectable } from '@angular/core';

@Injectable()
export class ConstProvider {

  public readonly PRIMARY_KEY: string = "wallet_primary_key";

  public readonly STORAGE = {
    CAMPAIGN_DRAFTS: "campaign_drafts"
  }

  public readonly INVITE_TYPE = {
    CAMPAIGN: "campaign",
    CIRCLE: "circle"
  }

  public readonly WALLET_STATUS = {
    NO_WALLET: "no_wallet",
    CORRUPT_WALLET: "corrupt_wallet",
    UNSET_WALLET: "unset_wallet",
    SUCCESS: "success"
  }

  public readonly NAV_PARAMS = {
    CAMPAIGN: "campaign",
    CIRCLE: "circle"
  }

  public readonly SURVEY = {
    YES_NO: "YES/NO",
    TEXT_FIELD: "TEXTFIELD",
    MULTIPLE_CHOICE: "MULTIPLE CHOICE"
  }

  public readonly SCHEDUALS = {
    DAILY: "Daily",
    WEEKLY: "Weekly",
    TWO_WEEKS: "Every two weeks",
    MONTHLY: "Monthly",
    LIFETIME: "Once in a lifetime"
  }

  public readonly CANCERS = {
    BREAST: "Breast Cancer",
    CERVICAL: "Cervical Cancer",
    COLON: "Colon Cancer",
    LUNG: "Lung Cancer",
    PROSTATE: "Prostate Cancer"
  }

  public readonly UNITS = {
    KG: "kg",
    INCHES: "in",
    MG_PER_DL: "mg/dL",
    PERCENT: "%",
    MMHG: "mmHg",
    BPM: "bpm",
    LBS: "lb"
  }

  public readonly CHALLENGE_TYPE = {
    INDICATOR_BASED: "INDICATOR_BASED"
  }

  public readonly CHALLENGE_TEMPLATE_TYPE = {
    CUSTOM: "CUSTOM"
  }

  public readonly CHALLENGE_SCOPE = {
    NO_INVITE: "noInvite"
  }

  public readonly REWARD_TYPES = {
    NO_REWARD: "No Rewards",
    FUND_YOURSELF: "Fund Yourself",
    PARTICIPATION_FEE: "Participation Fee",
    SPONSERS: "Sponsers"
  }

  public readonly FUND_SOURCE_TYPE = {
    MODERATOR: "moderator",
    PARTICIPANTS: "participants",
    SPONSERS: "sponsers"
  }

  public readonly REWARD_STATE = {
    CREATED: "created"
  }

  public readonly INVITE_STATE = {
    ACCEPT: "accept",
    DENY: "deny"
  }

  public readonly CAMPAIGN_CATEGORIES = {
    INVITATIONS: "Invitations",
    CURRENT: "Current Campaigns",
    HISTORY: "History",
    DRAFT: "Draft"
  }
  public readonly CAMPAIGN_SLIDES = {
    ACTIVE: "activeSlides",
    INVITES: "invitesSlides",
    HISTORY: "historySlides",
    DRAFT: "draftsSlides"
  }
  public readonly CAMPAIGN_DATE_LABELS = {
    START_ON: "Starts on: ",
    END_ON: "End on: ",
    ENDED: "Ended: ",
    STARTED: "Started: "
  }

  public readonly INVITE_INFO = {
    CHALLENGE: "challenge",
    CIRCLE: "circle",
    ADD: "add",
    SEND: "send"
  }

  public readonly INDICATORS = {
    ALCOHOL: "Alcohol",
    BMI: "BMI",
    CARDIO: "Cardio",
    DEPRESSION: "Depression",
    DIABETES: "Diabetes",
    EXERCISE: "Exercise",
    HYPERTENSION: "Hypertension",
    NUTRITION: "Nutrition",
    SLEEP: "Sleep",
    SMOKING: "Smoking",
    WAIST: "Waist Circumference",
    CANCER: "Cancer"
  }
  public readonly QUESTIONS = {
    ALCOHOL: {
      DRINK_ALCOHOL: "DRINK_ALCOHOL",
      DRINK_IN_A_DAY: "DRINK_IN_A_DAY",
      SIX_OR_MORE_DRINKS: "SIX_OR_MORE_DRINKS"
    },
    BMI: {
      WEIGHT: "Weight",
      HEIGHT: "Height",
    },
    CARDIO: {
      TOTAL_CHOLESTEROL: "TOTAL_CHOLESTEROL",
      HDL_CHOLESTEROL: "HDL_CHOLESTEROL"
    },
    DEPRESSION: {
      LITTLE_INTEREST: "LITTLE_INTEREST",
      FEELING_DOWN: "FEELING_DOWN",
      TROUBLE_FALLING: "TROUBLE_FALLING",
      FEELING_TIRED: "FEELING TIRED",
      POOR_APPETITE: "POOR_APPETITE",
      FEELING_BAD: "FEELING_BAD",
      TROUBLE_CONCENTRATING: "TROUBLE_CONCENTRATING",
      MOVING_SPEAKING_SLOWLY: "MOVING_SPEAKING_SLOWLY",
      THOUGHTS_DEAD_HURTING: "THOUGHTS_DEAD_HURTING"
    },
    DIABETES: {
      RELATIVE_WITH_DIABETES: "RELATIVE_WITH_DIABETES",
      HBA1C_LEVEL: "HBA1C_LEVEL",
      FASTING_GLUCOSE: "FASTING_GLUCOSE",
      ETHINICITY_BACKGROUND: "ETHINICITY_BACKGROUND"
    },
    EXERCISE: {
      EXE_STATUS: "EXE_STATUS"
    },
    HYPERTENSION: {
      SYSTOLIC_BLOOD: "SYSTOLIC_BLOOD",
      DIASTOLIC_BLOOD: "DIASTOLIC_BLOOD",
      TREATED_HIGH_BLOOD_PRESSURE: "TREATED_HIGH_BLOOD_PRESSURE"
    },
    NUTRITION: {
      FISH_MEAL: "FISH_MEAL",
      MEAT_INTAKE: "MEAT_INTAKE",
      LEGUMES_BEANS: "LEGUMES_BEANS",
      FRUITS: "FRUITS",
      VEGETABLES: "VEGETABLES",
      DIETARY_SALT: "DIETARY_SALT"
    },
    SLEEP: {
      SNORE_LOUDLY: "SNORE_LOUDLY",
      STOP_BREATH_SLEEPING: "STOP_BREATH_SLEEPING",
      FEEL_TIRED: "FEEL_TIRED",
      TREATED_HIGHBLOOD_PRESSURE: "TREATED_HIGHBLOOD_PRESSURE",
      FEMALE_COLLAR: "FEMALE_COLLAR",
      MALE_COLLAR: "MALE_COLLAR"
    },
    SMOKING: {
      DO_YOU_SMOKE: "DO_YOU_SMOKE"
    },
    WAIST: {
      WAIST_CIRCUMFERENCE: "WAIST_CIRCUMFERENCE"
    }

  }
}
