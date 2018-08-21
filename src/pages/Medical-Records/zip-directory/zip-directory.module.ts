import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ZipDirectoryPage } from './zip-directory';

@NgModule({
  declarations: [
    ZipDirectoryPage,
  ],
  imports: [
    IonicPageModule.forChild(ZipDirectoryPage),
  ],
})
export class ZipDirectoryPageModule {}
