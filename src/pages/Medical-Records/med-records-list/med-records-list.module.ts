import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MedRecordsListPage } from './med-records-list';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@NgModule({
  declarations: [
    MedRecordsListPage,
  ],
  imports: [
  	PdfViewerModule,
    IonicPageModule.forChild(MedRecordsListPage),
  ],
})
export class MedRecordsListPageModule {}
