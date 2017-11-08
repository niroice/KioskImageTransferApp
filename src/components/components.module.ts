import { NgModule, ChangeDetectorRef } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { OptionsPopup } from './options-popup/options-popup';

@NgModule({
	declarations: [OptionsPopup
    ],
	imports: [IonicModule],
	exports: [OptionsPopup
    ]
})
export class ComponentsModule {}
