import { OptionsPopoverModule } from './../../components/options-popup/popover.module';
//import { ImageGalleryComponent } from './../../components/image-gallery/image-gallery';
import { ImageMenuOptionsComponent } from './../../components/image-menu-options/image-menu-options';
import { ImageSelect } from './image-select';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

@NgModule({
  declarations: [
    ImageSelect,
    ImageMenuOptionsComponent,
    //ImageGalleryComponent
  ],
  imports: [
    IonicPageModule.forChild(ImageSelect),
    OptionsPopoverModule
  ],
  entryComponents: [
    ImageMenuOptionsComponent
  ]
})
export class ImageSelectModule {}
