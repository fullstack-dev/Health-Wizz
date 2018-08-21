import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RequestPasswordPage } from './request-password';

@NgModule({
  declarations: [
    RequestPasswordPage,
  ],
  imports: [
    IonicPageModule.forChild(RequestPasswordPage),
  ],
})
export class RequestPasswordPageModule {}
