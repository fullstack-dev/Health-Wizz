import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ConnectedDevicePage } from './connected-device';

@NgModule({
  declarations: [
    ConnectedDevicePage,
  ],
  imports: [
    IonicPageModule.forChild(ConnectedDevicePage),
  ],
})
export class ConnectedDevicePageModule {}
