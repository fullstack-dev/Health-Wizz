import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ManageRolesPage } from './manage-roles';

@NgModule({
  declarations: [
    ManageRolesPage,
  ],
  imports: [
    IonicPageModule.forChild(ManageRolesPage),
  ],
})
export class ManageRolesPageModule {}
