import { Pipe, PipeTransform } from '@angular/core';
import { CampaignTemplate } from '../../models/classes';

@Pipe({
  name: 'campaign',
})
export class CampaignPipe implements PipeTransform {
  transform(campaigns: any[], filter: any) {
    return campaigns.filter(function (campaign) {
      try {
        if (filter == null || filter == undefined) {
          return true;
        }
        const name: string = campaign.name;
        if (name.toLowerCase().indexOf(filter.toLowerCase()) != -1) {
          return true;
        } else {
          return false;
        }
      } catch (e) {
        return false;
      }
    });
  }
}

@Pipe({
  name: 'templateSearch',
})
export class TemplateSearchPipe implements PipeTransform {
  transform(templates: CampaignTemplate[], filter: any) {
    return templates.filter(function (template) {
      try {
        if (filter == null || filter == undefined) {
          return true;
        }
        return template.template.toLowerCase().indexOf(filter.toLowerCase()) > -1
      } catch (e) {
        return false;
      }
    });
  }
}
