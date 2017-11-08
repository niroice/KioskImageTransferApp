import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AlbumImage } from './../../app/classes/AlbumImage';
import { Album } from './../../app/classes/Album';
import { ResizeImageService } from './../../services/resize-image-service/resize-image-service';
import { AlbumService } from './../../services/album-service/album.service';
import { Component, OnInit, ViewChild, IterableDiffer, OnDestroy } from '@angular/core';
import { NavController, Platform, Content, NavParams } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'page-image-select',
  templateUrl: 'image-select.html'
})
export class ImageSelect implements OnInit, OnDestroy  {

  public images: AlbumImage[] = [];
  private readonly numberImagesRefreshLimit: number = 20;
  private referenceCheckIntervalTime: any;


  @ViewChild(Content) content: Content;

  constructor(public navCtrl: NavController, private navParms :NavParams, public domSanitizer: DomSanitizer, 
     private ref:ChangeDetectorRef, private albumService: AlbumService, private resizeImageServcie: ResizeImageService) {

    let albumIndex: number = this.navParms.get('albumIndex');    
    this.images = this.albumService.getAlbum(albumIndex).getAlbumImages();
    
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
