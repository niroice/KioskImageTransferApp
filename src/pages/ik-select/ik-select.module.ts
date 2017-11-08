import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { IkSelectPage } from './ik-select';

@NgModule({
  declarations: [
    IkSelectPage,
  ],
  imports: [
    IonicPageModule.forChild(IkSelectPage),
  ],
})
export class IkSelectPageModule {}
