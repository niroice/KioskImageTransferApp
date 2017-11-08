import { OptionsPopup } from './../../components/options-popup/options-popup';
import { IkSelectPage } from './../ik-select/ik-select';
import { ResizeImageService } from './../../services/resize-image-service/resize-image-service';
import { ImageSelect } from './../image-select/image-select';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { AlbumSortPage } from './../album-sort/album-sort';
import { Album } from './../../app/classes/Album';
import { AlbumService } from './../../services/album-service/album.service';
import { Component, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-albums-select',
  templateUrl: 'albums-select.html',
})
export class AlbumsSelectPage {

    public albums: Album[] = [];
    public albumsLoading: boolean = true;
    public imagesSelectedCount: number = 1;
    private popoverCSSclass: string = 'popover-album-sort';
    private numberThumbnailToGenerate: number = 0;

    private readonly oneMinuteMilliseconds: number =  60000;
    private readonly oneSecondMilliseconds: number = 1000;

    private averageThumbnailgenerateTime: number = 0;
    private loading: any;
    private timeRemaining: string;
    private checkTimeLeftTimer: any;

    private loadingContentMessage: string;
    private thumbnailsAllGenerated:boolean = false;

    private availableKiosks: string[] = [];

    private readonly proccessingMessage: string = `
    <h4 class=\"black"> Proccessing new images.</h4>
    <p>Time Left: <span class='load-images-time-remaining'> Calculating..</span></p>
    `;

    constructor(public navCtrl: NavController, public navParams: NavParams, public albumService: AlbumService,
                public popoverController: PopoverController, private domSanitizer: DomSanitizer,
                public loadingCtrl: LoadingController, public imageResizeService: ResizeImageService, 
                private optionsPopup: OptionsPopup, private changeRef: ChangeDetectorRef) {
    

        this.numberThumbnailToGenerate = this.albumService.getNumberThumbnailToGenerate();
        this.albums = this.albumService.getAlbums();
        
        if (this.numberThumbnailToGenerate > 0){

            // start generating any missing thumbnails, hide once complete
            this.albumService.generateMissingThumbnails().subscribe( result => {

                clearInterval(this.checkTimeLeftTimer);
                this.hideThumbnailLoadingAlert();
            });

            this.imageResizeService.getAverageResize().subscribe( result => {

                this.averageThumbnailgenerateTime = result;
                this.calculateAverageWaitTime();

                this.checkTimeLeftTimer = setInterval( () => { 
                    this.calculateAverageWaitTime()
                }, 4000);
            });
        }         
    }


    ionViewDidLoad() {
        
        this.showthumbnailLoadingAlert();
    }

    private calculateAverageWaitTime(){

        let timeLeftMilli: number = Math.ceil( this.averageThumbnailgenerateTime *
            this.imageResizeService.getNumberImagesToBeProccessed() );
        
        if ( timeLeftMilli > this.oneMinuteMilliseconds ){

            this.timeRemaining = Math.ceil(timeLeftMilli / this.oneMinuteMilliseconds) + " min";

        }else{
            
            this.timeRemaining = Math.ceil(timeLeftMilli / this.oneSecondMilliseconds) + " sec";
            
        }

        document.getElementsByClassName('load-images-time-remaining')[0].innerHTML = this.timeRemaining;
    }



    public showthumbnailLoadingAlert() {

        if (this.numberThumbnailToGenerate > 0 ){

            this.loading = this.loadingCtrl.create({
                content: this.proccessingMessage
            });
    
            this.loading.present();
        }
    }

    
    public hideThumbnailLoadingAlert(){
        this.loading.dismiss();
    }


    public createSortPopover(event){
        let poppover = this.popoverController.create( AlbumSortPage, {}, { cssClass: 'popover-album-sort' } );

        poppover.present({
            ev: event
        });

    }


    public createSelectIKPopover(){

        let options: { iconURL: any, label:string, tapAction: string }[] = [];

        options.push( { iconURL: null, label: "IK01", tapAction: "" } );

        this.optionsPopup.create( { header: "", options: options });


        this.optionsPopup.present();

        this.changeRef.detectChanges();
    }


    public sanitizerStyle(path:string): any {
        
        if (path != null){

            let url:string = "url(\"" + path + "\")";
            let safeStyle:SafeUrl = this.domSanitizer.bypassSecurityTrustStyle(url);
            
            return safeStyle;
        }else{

            return "";
        }
       
    }

    public loadAlbum(albumIndex){
        this.navCtrl.push(ImageSelect, { albumIndex: albumIndex})
    }

}
