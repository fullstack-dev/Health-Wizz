import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { XmlViewerPage } from './xml-viewer';

@NgModule({
  declarations: [
    XmlViewerPage,
  ],
  imports: [
    IonicPageModule.forChild(XmlViewerPage),
  ],
})
export class XmlViewerPageModule {}
