import { ImageSelect } from './image-select';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

@NgModule({
  declarations: [
    ImageSelect,
  ],
  imports: [
    IonicPageModule.forChild(ImageSelect),
  ],
})
export class ImageSelectModule {}
