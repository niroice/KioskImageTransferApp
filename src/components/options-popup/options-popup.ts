import { PopoverController, Platform } from 'ionic-angular';
import { PopoverServiceProvider } from '../options-popup/popover-service';
import { Component, NgModule } from '@angular/core';
import { Renderer2 } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'options-popup',
  templateUrl: 'options-popup.html',
  animations: [
      trigger('popOverPanel', [
          state('smallSize', style({
              transform: 'scale(.1)'
          })),
          state('largeSize', style({
              transform: 'scale(1)'
          })),
          transition('smallSize => largeSize', animate('4000ms linear')),
          transition('largeSize => smallSize', animate('4000ms linear')),
      ])
  ]
})

export class OptionsPopup {

    private readonly noScrollClass: string = 'no-scroll';
    private readonly contentAreaID: string = 'content-area';
    public currentState: string = 'smallSize';
    public leftPosition: number = 0;
    public topPosition: number = 0;
    public containerCurrentScale: number = 0;
    private readonly animateMilliseconds: number = 200;
    private readonly increaseScaleBy: number = .2;
    private readonly fullScale: number = 1;
    private enlargeIntervalTimer: any;
    private enlargeAlreadyCalled: boolean = false;


    constructor( public popoverServiceProvider: PopoverServiceProvider, private renderer: Renderer2,
                public platform: Platform) {

    
    }

    ngAfterViewInit(){
        
    }

    private enlargeContainer(){

        if ( this.enlargeAlreadyCalled == false){

            this.enlargeAlreadyCalled = true;

            let enlargeInterval: number = this.animateMilliseconds / ( this.fullScale / this.increaseScaleBy);
            
            this.enlargeIntervalTimer = setInterval( ()=>{
    
                // cancel timmer if at full scale
                if ( this.containerCurrentScale >= 1){
    
                    clearInterval(this.enlargeIntervalTimer);

                    console.log("finished scaled is: " + this.containerCurrentScale);

                }else{

                     // increase size by .5
                    this.containerCurrentScale += this.increaseScaleBy;
                }
            }, enlargeInterval);
        }
    }
    
    ngDoCheck(){

        // if popover menu is called - peform:
        if (this.popoverServiceProvider.showMenuBoolean == true ){

            // disable body scrolling if menu is showing, else enable it
            this.renderer.addClass(document.getElementById(this.contentAreaID), this.noScrollClass);

            // run animation for enlarging the container
            this.enlargeContainer();

        // else if popover menu is close - peform:
        }else{
            this.renderer.removeClass(document.getElementById(this.contentAreaID), this.noScrollClass);
            this.currentState = 'smallSize';

            this.enlargeAlreadyCalled = false; // allow the enlarge animation to run again once menu has been closed
            this.containerCurrentScale = 0; // set scale back to zero - so animation can repeat
        }
    }

}
