import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SearchRecordsPage } from './search-records';

@NgModule({
  declarations: [
    SearchRecordsPage,
  ],
  imports: [
    IonicPageModule.forChild(SearchRecordsPage),
  ],
})
export class SearchRecordsPageModule {}
