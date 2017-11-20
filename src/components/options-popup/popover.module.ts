import { OptionsPopup } from '../options-popup/options-popup';
import { PopoverServiceProvider } from '../options-popup/popover-service';
import { IonicModule } from 'ionic-angular';
import { NgModule, Renderer2 } from '@angular/core';

@NgModule({
	declarations: [ OptionsPopup ],
	imports: [ IonicModule ],
    exports: [OptionsPopup],
    providers: [PopoverServiceProvider]
})
export class OptionsPopoverModule {}
