
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AlbumsSelectPage } from './albums-select';

@NgModule({
  declarations: [
    AlbumsSelectPage,
  ],
  imports: [
    IonicPageModule.forChild(AlbumsSelectPage),
  ],
})
export class AlbumsSelectPageModule {}
