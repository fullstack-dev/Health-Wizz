import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PrivacySettingPage } from './privacy-setting';

@NgModule({
  declarations: [
    PrivacySettingPage,
  ],
  imports: [
    IonicPageModule.forChild(PrivacySettingPage),
  ],
})
export class PrivacySettingPageModule {}
