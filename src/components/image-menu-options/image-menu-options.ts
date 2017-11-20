import { DisplayService } from './../../services/display-service/display-service';
import { NavParams } from 'ionic-angular';
import { AlbumService } from './../../services/album-service/album.service';
import { Component, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'image-menu-options',
  templateUrl: 'image-menu-options.html'
})
export class ImageMenuOptionsComponent {

    public showFileNameStatus: boolean;
    public readonly sortNewestToOldest = "newest-oldest";
    public readonly sortOldestToNewest = "oldest-newest";
    public readonly sortFileNameAscending = "a-z";
    public readonly sortFileNameDescending = "z-a";

    public readonly smallThumbnail: string = "small";
    public readonly mediumThumbnail: string = "medium";
    public readonly largeThumbnail: string = "large";
    public currentSortImagesBy: string;
    public albumIndex: number;
    public currentThumbnailSize: string;
    public firstLoadThumbSize: boolean = true;
    public firstLoadSortBy: boolean = true;
  

    constructor( public albumService: AlbumService, public navParams: NavParams, 
        private displayService: DisplayService, private changeDetectorRef: ChangeDetectorRef ) {

        this.showFileNameStatus = this.albumService.getShowFileNameStatus();
        this.albumIndex = this.navParams.get('albumIndex');
        this.currentSortImagesBy = this.albumService.getAlbum(this.albumIndex).getCurrentImageSortBy();
        this.currentThumbnailSize = this.displayService.getCurrentThumbnailSizeType();
    }

    public setShowFileNameStatus(){
        this.albumService.setShowFileNameStatus( this.showFileNameStatus);
    }

    ngDoCheck(){
        

    }


    public setThumbnailSize(){

        // skip setting thumnbail size when pop is first created, as its not needed
        // stops screen refresh when menu shows
        if ( this.firstLoadThumbSize == false ){            

            if ( this.currentThumbnailSize == this.smallThumbnail ){
                
                this.displayService.setThumbnailSizeSmall();
            }
            else if ( this.currentThumbnailSize == this.mediumThumbnail ){
    
                this.displayService.setThumbnailSizeMedium();
            }
            else{
    
                this.displayService.setThumbnailSizeLarge();
            }
        }
        else{

            this.firstLoadThumbSize = false;
        }
        
    }

    public selectAllImages(){

        let numberImages = this.albumService.getAlbum(this.albumIndex).getAlbumImages().length;
        let images = this.albumService.getAlbum(this.albumIndex).getAlbumImages();
        let numberImagesAlreadySelected: number = 0;

        // determain how many images already selected
        for (let i = 0; i < images.length; i++ ){

            // if image alreadly selected increase already numberImagesAlreadySelected count
            if (images[i].getSelectedStatus() == true ){

                numberImagesAlreadySelected++
            }
            // if image not selected - set selected
            else{

                images[i].setImageSelectedStatus(true);

            }
        }

        // subtract number images already selected from total number of images selected and increase image
        // selected count
        this.albumService.increaseImageSelectedCount( ( numberImages - numberImagesAlreadySelected) );
    }



    public deselectAllImages(){
        
        let numberImages = this.albumService.getAlbum(this.albumIndex).getAlbumImages().length;
        let images = this.albumService.getAlbum(this.albumIndex).getAlbumImages();
        let numberImagesAlreadySelected: number = 0;

        // determain how many images already selected
        for (let i = 0; i < images.length; i++ ){

            // if image alreadly selected increase already numberImagesAlreadySelected count
            // set image selected to false
            if (images[i].getSelectedStatus() == true ){
                
                numberImagesAlreadySelected++
                images[i].setImageSelectedStatus(false);
            }
        }

        // decrease number of images selected count by the number selected
        this.albumService.decreaseImageSelectedCount( numberImagesAlreadySelected );
    }


    public setImageSortBy(){

        // skip checking sort by when loading popup - stops 
        if ( this.firstLoadSortBy == false ){

            if ( this.currentSortImagesBy == this.sortNewestToOldest){
                
                this.albumService.getAlbum(this.albumIndex).sortImagesNewestToOldest();
                
            }
            else if ( this.currentSortImagesBy == this.sortOldestToNewest ){
    
                this.albumService.getAlbum(this.albumIndex).sortImagesOldestToNewest();
            }
            else if ( this.currentSortImagesBy == this.sortFileNameAscending ){
    
                this.albumService.getAlbum(this.albumIndex).sortImagesByNameAscending();
    
            }
            else if ( this.currentSortImagesBy == this.sortFileNameDescending ){
    
                this.albumService.getAlbum(this.albumIndex).sortImagesByNameDescending();
            }
        }
        else{
            this.firstLoadSortBy = false;
        }

    }



}
