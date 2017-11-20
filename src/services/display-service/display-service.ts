import { Observer } from 'rxjs/Observer';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';


@Injectable()

export class DisplayService {

    private readonly heightRatio: number = 0.75;
    private readonly marginBothSidesPixels: number = 1;
    private readonly portrait: string = 'portrait';
    private readonly landscape: string = 'landscape';
    private readonly smallThumbnail: string = "small";
    private readonly mediumThumbnail: string = "medium";
    private readonly largeThumbnail: string = "large";

    // number of items per line - used calculate Thumbnail sizes
    private readonly twoItemsPerLine: number = 2;
    private readonly threeItemsPerLine: number = 3;
    private readonly fourItemsPerLine: number = 4;
    private readonly fiveItemsPerLine: number = 5;
    private readonly sevenItemsPerLine: number = 7;

    

    private smallThumbnailWidthPortrait: number;
    private smallThumbnailHeightPortrait: number;
    private smallThumbnailWidthLandscape: number;
    private smallThumbnailHeightLandscape: number;

    private mediumThumbnailWidthPortrait: number;
    private mediumThumbnailHeightPortrait: number;
    private mediumThumbnailWidthLandscape: number;
    private mediumThumbnailHeightLandscape: number;

    private largeThumbnailWidthPortrait: number;
    private largeThumbnailHeightPortrait: number;
    private largeThumbnailWidthSizeLandscape: number;
    private largeThumbnailHeightSizeLandscape: number;

    private currentThumbnailHeight: number;
    private currentThumbnailWidth: number;
    private currentScreenOrientation: string;
    private currentThumbnailSizeRequested: string;

    private thumbnailSizeChangedObserver: Observer <{ size: string, orientation: string}>;
    private thumbnailSizeChangeObservable: Observable <{ size: string, orientation: string}>;

    constructor( private platform: Platform ) {

        // run functions when platform is ready
        this.platform.ready().then( ()=> {
            this.calculateThumbnailSizes();

            this.currentThumbnailHeight = this.smallThumbnailHeightPortrait;
            this.currentThumbnailWidth = this.smallThumbnailWidthPortrait;
            this.currentScreenOrientation = this.portrait;
            this.currentThumbnailSizeRequested = this.smallThumbnail;



            this.thumbnailSizeChangeObservable = Observable.create( observer => {
                this.thumbnailSizeChangedObserver = observer;
            });

        });
    }

    ngOnInit() {

        window.onorientationchange = () => {
            setTimeout( () => {
                this.checkOrientation();
                console.log("checking screen orientaiton")
            }, 300);
        }
    }

    public thumbnailSizeChangeObserve(): Observable< { size: string, orientation: string} >{
        return this.thumbnailSizeChangeObservable;
    }

    private checkOrientation(){

        console.log("inside screen orientaiton")
        // if new oritentation is portrait, will be 0 or 180
        if ( window.orientation == 0 || window.orientation == 180 ){
            
            if ( this.currentScreenOrientation != this.portrait){

                // changle thumbnail size to portrait based on its current size
                if ( this.currentThumbnailSizeRequested == this.smallThumbnail ){

                    this.currentThumbnailHeight = this.smallThumbnailHeightPortrait;
                    this.currentThumbnailWidth = this.smallThumbnailWidthPortrait;
                }
                else if ( this.currentThumbnailSizeRequested == this.mediumThumbnail){

                    this.currentThumbnailHeight = this.mediumThumbnailHeightPortrait;
                    this.currentThumbnailWidth = this.mediumThumbnailWidthPortrait;
                }
                else{

                    this.currentThumbnailHeight = this.largeThumbnailHeightPortrait;
                    this.currentThumbnailWidth = this.largeThumbnailWidthPortrait;

                }
            }

        }
        // if new orientation is landscape, it will be 90 or -90 or else
        else{

            if ( this.currentScreenOrientation != this.landscape ){
                    
                // changle thumbnail size to portrait based on its current size
                if ( this.currentThumbnailSizeRequested == this.smallThumbnail ){

                    this.currentThumbnailHeight = this.smallThumbnailHeightLandscape;
                    this.currentThumbnailWidth = this.smallThumbnailWidthLandscape;
                }
                else if ( this.currentThumbnailSizeRequested == this.mediumThumbnail){

                    this.currentThumbnailHeight = this.mediumThumbnailHeightLandscape;
                    this.currentThumbnailWidth = this.mediumThumbnailWidthLandscape;
                }
                else{

                    this.currentThumbnailHeight = this.largeThumbnailHeightSizeLandscape;
                    this.currentThumbnailWidth = this.largeThumbnailWidthSizeLandscape;

                }        
            }
        }
    }

    private calculateThumbnailSizes(){
        
        // calculate required thumbnail sizes based on device resolution
        this.smallThumbnailWidthPortrait = Math.floor( this.platform.width() / this.fourItemsPerLine);

        this.smallThumbnailHeightPortrait =  Math.floor( this.smallThumbnailWidthPortrait * this.heightRatio );

        this.smallThumbnailWidthLandscape = Math.floor( this.platform.height() / this.sevenItemsPerLine) ;

        this.smallThumbnailHeightLandscape =  Math.floor( this.smallThumbnailWidthLandscape * this.heightRatio );

        
        this.mediumThumbnailWidthPortrait = Math.floor( this.platform.width() / this.threeItemsPerLine );

        this.mediumThumbnailHeightPortrait =  Math.floor( this.mediumThumbnailWidthPortrait * this.heightRatio );

        this.mediumThumbnailWidthLandscape = Math.floor( this.platform.height() / this.fiveItemsPerLine) ;
        
        this.mediumThumbnailHeightLandscape =  Math.floor( this.mediumThumbnailWidthLandscape * this.heightRatio );

        
        this.largeThumbnailWidthPortrait = Math.floor( this.platform.width() / this.twoItemsPerLine );

        this.largeThumbnailHeightPortrait =  Math.floor( this.largeThumbnailWidthPortrait * this.heightRatio );

        this.largeThumbnailWidthSizeLandscape = Math.floor( this.platform.height() / this.fourItemsPerLine) ;
        
        this.largeThumbnailHeightSizeLandscape =  Math.floor( this.largeThumbnailWidthSizeLandscape * this.heightRatio );

        console.log("small thumbnail width portrait = " + this.smallThumbnailWidthPortrait);
        console.log("small thumbnail height portrait = " + this.smallThumbnailHeightPortrait);
        console.log("small thumbnail width landscape = " + this.smallThumbnailWidthLandscape);
        console.log("small thumbnail height landscape = " + this.smallThumbnailHeightLandscape);

        console.log("medium thumbnail width  portrait = " + this.mediumThumbnailWidthPortrait);
        console.log("medium thumbnail height portrait = " + this.mediumThumbnailHeightPortrait);

        console.log("large thumbnail width  portrait = " + this.largeThumbnailWidthPortrait);
        console.log("large thumbnail height portrait = " + this.largeThumbnailHeightPortrait);
    }

    public getThumbnailHeight(): number{
        return this.currentThumbnailHeight;
    }

    public getThumbnailWidth(): number{
        return this.currentThumbnailWidth;
    }

    public setThumbnailSizeSmall(){

        this.currentThumbnailSizeRequested = this.smallThumbnail;

        if ( this.currentScreenOrientation == this.portrait ){

            this.currentThumbnailHeight = this.smallThumbnailHeightPortrait;
            this.currentThumbnailWidth = this.smallThumbnailWidthPortrait;

        }else{

            this.currentThumbnailHeight = this.smallThumbnailHeightLandscape;
            this.currentThumbnailWidth = this.smallThumbnailWidthLandscape;
        }

        this.thumbnailSizeChangedObserver.next( { size: this.currentThumbnailSizeRequested,
             orientation: this.currentScreenOrientation });
    }


    public setThumbnailSizeMedium(){
        
        this.currentThumbnailSizeRequested = this.mediumThumbnail;

        if ( this.currentScreenOrientation == this.portrait ){

            this.currentThumbnailHeight = this.mediumThumbnailHeightPortrait;
            this.currentThumbnailWidth = this.mediumThumbnailWidthPortrait;

        }else{

            this.currentThumbnailHeight = this.mediumThumbnailHeightLandscape;
            this.currentThumbnailWidth = this.mediumThumbnailWidthLandscape;
        }

        this.thumbnailSizeChangedObserver.next( { size: this.currentThumbnailSizeRequested,
             orientation: this.currentScreenOrientation });
    }


    public setThumbnailSizeLarge(){
        
        this.currentThumbnailSizeRequested = this.largeThumbnail;

        if ( this.currentScreenOrientation == this.portrait ){

            this.currentThumbnailHeight = this.largeThumbnailHeightPortrait;
            this.currentThumbnailWidth = this.largeThumbnailWidthPortrait;

        }else{

            this.currentThumbnailHeight = this.largeThumbnailHeightSizeLandscape;
            this.currentThumbnailWidth = this.largeThumbnailWidthSizeLandscape;
        }

        this.thumbnailSizeChangedObserver.next( { size: this.currentThumbnailSizeRequested,
             orientation: this.currentScreenOrientation });
    }

    public getCurrentThumbnailSizeType():string{
        return this.currentThumbnailSizeRequested;
    }

    public getCurrentOrientation():string{
        return this.currentScreenOrientation;
    }
 
}
