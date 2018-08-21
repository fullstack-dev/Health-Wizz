import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PdfViewerPage } from './pdf-viewer';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@NgModule({
  declarations: [
    PdfViewerPage,
  ],
  imports: [
  	PdfViewerModule,
    IonicPageModule.forChild(PdfViewerPage),
  ],
})
export class PdfViewerPageModule {}
