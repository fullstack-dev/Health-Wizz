import { Injectable } from '@angular/core';

@Injectable()
export class ValidatorProvider {
  public readonly profile_validator: ProfileValidator = new ProfileValidator();
  public readonly indicator_validator: IndicatorValidator = new IndicatorValidator();
  public readonly campaign_validator: CampaignValidator = new CampaignValidator();
  public readonly healthwizz_validator: HealthwizzValidator = new HealthwizzValidator();
}

class CampaignValidator {
  public name_pattern: RegExp = /^[A-Za-z0-9\s'-]+$/;
}
class ProfileValidator {
  public name_maxlength: number = 20;
  public name_pattern: RegExp = /^[A-Za-z'-]+$/;
}

class HealthwizzValidator {
  public email_pattern: RegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  public password_pattern: RegExp = /^(?=.*[A-Z])(?=.*[!@#$&*-_])(?=.*[0-9])(?!.*\s).{0,}$/;
  public password_length: number = 6;
  public zip_code_pattern: RegExp = /^(?!0+$)[0-9]+$/;
}

class IndicatorValidator {
  public value_pattern: RegExp = /^(?!0)(\d{1,})(\.\d{1,2})?$/;
}