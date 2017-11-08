import { Component, Injectable } from '@angular/core';

@Component({
  selector: 'options-popup',
  templateUrl: 'options-popup.html'
})

@Injectable()
export class OptionsPopup {

    public showOptionsMenu:boolean = false;
    public optionsMenu: {
        header:string,
        options: { iconURL: any, label:string, tapAction: string }[]
    };
    
    constructor( ) {
    
    }

    public create( optionsMenu: { header:string, options: { iconURL: any, label:string,
            tapAction: string }[] } ){
    
        this.optionsMenu = optionsMenu;
    }

    public present(){
        
        this.showOptionsMenu = true;
        console.log("present clicked - set to " + this.showOptionsMenu);
    }

    public dismiss(){
        this.showOptionsMenu = false;
    }

}
