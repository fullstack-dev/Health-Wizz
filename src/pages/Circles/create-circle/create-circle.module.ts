import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreateCirclePage } from './create-circle';
import { Camera } from '@ionic-native/camera';

@NgModule({
  declarations: [
    CreateCirclePage,
  ],
  imports: [
    IonicPageModule.forChild(CreateCirclePage),
  ],
  providers: [
  	Camera,
  ]
})
export class CreateCirclePageModule {}
