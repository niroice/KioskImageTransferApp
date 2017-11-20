import { DisplayService } from './../../services/display-service/display-service';
import { SortAlbumPipe } from './../../pipes/sort-album/sort-album';
import { ImageMenuOptionsComponent } from './../../components/image-menu-options/image-menu-options';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AlbumImage } from './../../app/classes/AlbumImage';
import { Album } from './../../app/classes/Album';
import { ResizeImageService } from './../../services/resize-image-service/resize-image-service';
import { AlbumService } from './../../services/album-service/album.service';
import { Component, OnInit, ViewChild, IterableDiffer, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams, PopoverController } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { ElementRef } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { PopoverServiceProvider } from './../../components/options-popup/popover-service';

@Component({
  selector: 'page-image-select',
  templateUrl: 'image-select.html'
})
export class ImageSelect implements OnInit, OnDestroy  {

  public images: AlbumImage[] = [];
  private readonly numberImagesRefreshLimit: number = 20;
  private referenceCheckIntervalTime: any;
  private albumIndex: number;
  private thumbnailHeight: number;
  private thumbnailWidth: number;
  public approxHeight: string;
  public approxWidth: string;
  public showGallery: boolean = true;
  private thumbnailSizeChange: any;
  public showingPopup: boolean = false;

    constructor(public navCtrl: NavController, private navParms :NavParams, public domSanitizer: DomSanitizer, 
                private ref:ChangeDetectorRef, public albumService: AlbumService, 
                private resizeImageServcie: ResizeImageService, private popOverController: PopoverController,
                public displayService: DisplayService, private changeRef: ChangeDetectorRef, 
                private viewController: ViewController, private popoverServiceProvider: PopoverServiceProvider ) {

        this.approxHeight = this.displayService.getThumbnailHeight() + 'px';
        this.approxWidth = this.displayService.getThumbnailWidth() + 'px';
        this.albumIndex = this.navParms.get('albumIndex');    
        this.images = this.albumService.getAlbum(this.albumIndex).getAlbumImages();

        this.thumbnailSizeChange = displayService.thumbnailSizeChangeObserve().subscribe( result => {
            this.approxHeight = this.displayService.getThumbnailHeight() + 'px';
            this.approxWidth = this.displayService.getThumbnailWidth() + 'px';
            //this.showGallery = false;

            // reload the page
            this.navCtrl.push( this.navCtrl.getActive().component, { albumIndex: this.albumIndex},
                 { animate: false } ).then( ()=> {
                let index = this.viewController.index;
                this.navCtrl.remove(index);
            });

        });
        
        
    }

    ngOnInit(){

        // this.referenceCheckIntervalTime = setInterval( ()=> {
        //     this.ref.detectChanges();
        // },4000);
        
    }

    ngOnDestroy(){
        // clearInterval(this.referenceCheckIntervalTime);
    }

    public sanatiseURL(path:string):SafeUrl{
        
        return this.domSanitizer.bypassSecurityTrustStyle(path);
        
    }

    public generateThumbnailPath(image: AlbumImage){
        let path: string = "url(\'" + image.getThumbnailPath() + "/" + image.getThumbnailName() + "\')";
        return this.domSanitizer.bypassSecurityTrustStyle(path);
    }

    public showOptionsMenu(event){
        let data: { albumIndex:number } = { albumIndex: this.albumIndex };

        let popover = this.popOverController.create(ImageMenuOptionsComponent, data);
        popover.present( {
            ev: event
        });
    }

    public createSelectIKPopover(){
        
        let options: { iconURL: any, label:string, tapAction: string }[] = [];

        this.showingPopup = true;
        
        options.push( { iconURL: null, label: "IK01", tapAction: "" } );
        options.push( { iconURL: null, label: "IK02", tapAction: "" } );
        options.push( { iconURL: null, label: "IK03", tapAction: "" } );
        options.push( { iconURL: null, label: "IK04", tapAction: "" } );
        options.push( { iconURL: null, label: "IK05", tapAction: "" } );
        options.push( { iconURL: null, label: "IK06", tapAction: "" } );
        options.push( { iconURL: null, label: "IK07", tapAction: "" } );
        options.push( { iconURL: null, label: "IK08", tapAction: "" } );
        options.push( { iconURL: null, label: "IK09", tapAction: "" } );
        options.push( { iconURL: null, label: "IK10", tapAction: "" } );
        options.push( { iconURL: null, label: "IK11", tapAction: "" } );
        options.push( { iconURL: null, label: "IK12", tapAction: "" } );

        console.log(options);
    
        this.popoverServiceProvider.createOptionsPopover({ header: "test header", options: options }).subscribe( result =>{
            this.showingPopup = false;
        });

        this.popoverServiceProvider.present();
        
    }

    public imageClicked(image: AlbumImage){

        // if image already selected set unselected
        if ( image.getSelectedStatus() == true){
            
            image.setImageSelectedStatus(false); // un-selected set status to false
            this.albumService.decreaseImageSelectedCount(1); // decrease images selected by one
        }
        // if image is not selected, set to selected
        else{

            image.setImageSelectedStatus(true); // selected set status to true
            this.albumService.increaseImageSelectedCount(1); // increase image selected by one
        }
    }


    ngDoCheck(){
      
    }


}