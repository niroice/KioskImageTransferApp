import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';


@Injectable()
export class PopoverServiceProvider {

    public showMenuBoolean: boolean = false;
    public optionsMenu: { header:string, options: { iconURL: string, label:string,
                        tapAction: string }[] };
    private popoverObserver: Observer <any>;
    private popoverObservable: Observable <any>;
    private readonly noScrollClass: string = 'no-scroll';


    constructor( ) {

        this.popoverObservable = Observable.create( observer =>{
            this.popoverObserver = observer;
        });
    }

    public createOptionsPopover( optionsMenu: { header:string, options: { iconURL: string, label:string,
        tapAction: string }[] } ) : Observable<any>{

            this.optionsMenu = optionsMenu;

            return this.popoverObservable;
    }

    public present(){
        this.showMenuBoolean = true;
    }

    public returnOption(option:any){

        this.popoverObserver.next(option);
        this.popoverObserver.complete();
        this.showMenuBoolean = false;
    }

    public cancel(){
        this.popoverObserver.next({result: "cancelled"});
        this.popoverObserver.complete();
        this.showMenuBoolean = false;

    }

}
