import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AlbumSortPage } from './album-sort';

@NgModule({
  declarations: [
    AlbumSortPage,
  ],
  imports: [
    IonicPageModule.forChild(AlbumSortPage),
  ],
})
export class AlbumSortPageModule {}
