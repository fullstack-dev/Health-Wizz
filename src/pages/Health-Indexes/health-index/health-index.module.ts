import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HealthIndexPage } from './health-index';

@NgModule({
  declarations: [
    HealthIndexPage,
  ],
  imports: [
    IonicPageModule.forChild(HealthIndexPage),
  ],
})
export class HealthIndexPageModule {}
