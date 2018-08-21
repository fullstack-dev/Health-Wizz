import { NgModule } from '@angular/core';
import { CampaignPipe, TemplateSearchPipe } from './campaign/campaign';
import { CircleSearchPipe } from './circle-search/circle-search';
import { InvitePeopleSearchPipe } from './invite-people-search/invite-people-search';
import { OrderSeed } from './pipes.wallet';
@NgModule({
    declarations: [
        CampaignPipe,
        TemplateSearchPipe,
        CircleSearchPipe,
        InvitePeopleSearchPipe,
        OrderSeed
    ],
    imports: [],
    exports: [
        CampaignPipe,
        TemplateSearchPipe,
        CircleSearchPipe,
        InvitePeopleSearchPipe,
        OrderSeed
    ]
})
export class PipesModule { }
