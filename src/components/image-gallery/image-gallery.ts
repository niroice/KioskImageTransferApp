import { DisplayService } from './../../services/display-service/display-service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AlbumImage } from './../../app/classes/AlbumImage';
import { Album } from './../../app/classes/Album';
import { AlbumService } from './../../services/album-service/album.service';
import { Component, OnInit, IterableDiffer, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams, PopoverController } from 'ionic-angular';
import { ElementRef } from '@angular/core';

// import { DisplayService } from './../../services/display-service/display-service';
// import { SortAlbumPipe } from './../../pipes/sort-album/sort-album';
// import { ImageMenuOptionsComponent } from './../../components/image-menu-options/image-menu-options';
// import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
// import { AlbumImage } from './../../app/classes/AlbumImage';
// import { Album } from './../../app/classes/Album';
// import { ResizeImageService } from './../../services/resize-image-service/resize-image-service';
// import { AlbumService } from './../../services/album-service/album.service';
// import { Component, OnInit, ViewChild, IterableDiffer, OnDestroy, ChangeDetectorRef } from '@angular/core';
// import { NavController, NavParams, PopoverController } from 'ionic-angular';
// import { Observable } from 'rxjs/Observable';
// import { Observer } from 'rxjs/Observer';
// import { ElementRef } from '@angular/core';

@Component({
  selector: 'image-gallery',
  templateUrl: 'image-gallery.html'
})

export class ImageGalleryComponent implements OnInit, OnDestroy  {

  public images: AlbumImage[] = [];
  private readonly numberImagesRefreshLimit: number = 20;
  private referenceCheckIntervalTime: any;
  private albumIndex: number;
  private thumbnailHeight: number;
  private thumbnailWidth: number;
  public approxHeight: string;

    constructor(public navCtrl: NavController, private navParms :NavParams, public domSanitizer: DomSanitizer, 
                private ref:ChangeDetectorRef, public albumService: AlbumService, public displayService: DisplayService ) {

        this.approxHeight = this.displayService.getThumbnailHeight() + 'px';
        this.albumIndex = this.navParms.get('albumIndex');    
        this.images = this.albumService.getAlbum(this.albumIndex).getAlbumImages();
    }

    ngOnInit(){

        this.referenceCheckIntervalTime = setInterval( ()=> {
            this.ref.detectChanges();
        },4000);
        
    }

    ngOnDestroy(){
        clearInterval(this.referenceCheckIntervalTime);
    }

    public sanatiseURL(path:string):SafeUrl{
        
        return this.domSanitizer.bypassSecurityTrustStyle(path);
        
    }

    public generateThumbnailPath(image: AlbumImage){

        let path: string = "url(\'" + image.getThumbnailPath() + "/" + image.getThumbnailName() + "\')";
        return this.domSanitizer.bypassSecurityTrustStyle(path);
    }

}
