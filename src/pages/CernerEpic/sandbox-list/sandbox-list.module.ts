import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SandboxListPage } from './sandbox-list';

@NgModule({
  declarations: [
    SandboxListPage,
  ],
  imports: [
    IonicPageModule.forChild(SandboxListPage),
  ],
})
export class SandboxListPageModule {}
