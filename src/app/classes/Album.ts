import { DomSanitizer } from '@angular/platform-browser';
import { ResizeImageService } from './../../services/resize-image-service/resize-image-service';
import { AlbumImage } from './AlbumImage';

export class Album{

    private images: AlbumImage[] =[];
    private albumName:string;
    private albumPath: string;
    private numberImages: number;
    private lastModified: number;
    //private albumThumbnails: AlbumImage[] = [];
    private albumThumbnail: AlbumImage;
    private currentSortBy = "";
    public readonly sortNewestToOldest = "newest-oldest";
    public readonly sortOldestToNewest = "oldest-newest";
    public readonly sortFileNameAscending = "a-z";
    public readonly sortFileNameDescending = "z-a";

    constructor(name:string, path:string, numberImages:number, lastModified: number){

        this.albumName = name;
        this.albumPath = path;
        this.numberImages = numberImages;
        this.lastModified = lastModified;
        this.currentSortBy = this.sortNewestToOldest;
    }

    // Description: Sets the album cover images as that latest image
    // Parameters:  none
    // Return:      none
    public setAlbumCover(){

        // check images are available
        if (this.images.length < 1){
            throw Error("AlbumImage - setAlbumCover() - No images currently set, add the images before setting the cover.");
        }
        else{
            // sort array from latest to oldest
            this. sortImagesNewestToOldest();
        
            // set the thumbnail as first element - recreate so its pass by value instead of reference
            this.albumThumbnail = new AlbumImage(
                this.images[0].getImageFileName(),
                this.images[0].getImagePath(),
                this.images[0].getImageLastModified()
            );
        }
    }


    // Description: Sorts all the current images loaded by Newest to Oldest
    // Parameters:  none
    // Return:      none
    public sortImagesNewestToOldest(){
        
        let sortedImages:AlbumImage[] = this.images.sort( (obj1, obj2) => {
            
            if (obj1.getImageLastModified() > obj2.getImageLastModified()) {
                return -1;
            }
        
            if (obj1.getImageLastModified() < obj2.getImageLastModified()) {
                return 1;
            }
        
            return 0;
        });

        this.images = sortedImages;
        this.currentSortBy = this.sortNewestToOldest;
    }


    // Description: Sorts all the current images from oldest to Newest
    // Parameters:  none
    // Return:      none
    public sortImagesOldestToNewest(){

        let sortedImages:AlbumImage[] = this.images.sort( (obj1, obj2) => {
            
            if (obj1.getImageLastModified() > obj2.getImageLastModified()) {
                return 1;
            }
        
            if (obj1.getImageLastModified() < obj2.getImageLastModified()) {
                return -1;
            }
        
            return 0;
        });

        this.images = sortedImages;
        this.currentSortBy = this.sortOldestToNewest;
    }


    // Description: Sorts all the current images in the album by file name - ascending order (A-Z)
    // Parameters:  none
    // Return:      none
    public sortImagesByNameAscending(){
        
        let sortedImages:AlbumImage[] = this.images.sort( (obj1, obj2) => {
            
            if (obj1.getImageFileName().toLowerCase() < obj2.getImageFileName().toLowerCase() ) {
                return -1;
            }
        
            if (obj1.getImageFileName().toLowerCase() > obj2.getImageFileName().toLowerCase() ) {
                return 1;
            }
        
            return 0;
        });

        this.images = sortedImages;
        this.currentSortBy = this.sortFileNameAscending;
    }


    // Description: Sorts all the current images in the album by file name - Descending order (A-Z)
    // Parameters:  none
    // Return:      none
    public sortImagesByNameDescending(){
        
        let sortedImages:AlbumImage[] = this.images.sort( (obj1, obj2) => {

            if ( obj1.getImageFileName().toLowerCase() > obj2.getImageFileName().toLowerCase() ) {
                return -1;
            }
        
            if (obj1.getImageFileName().toLowerCase() < obj2.getImageFileName().toLowerCase() ) {
                return 1;
            }
        
            return 0;
        });

        this.images = sortedImages;
        this.currentSortBy = this.sortFileNameDescending;
    }


    public setAllImagesToSelected(){

        for ( let i :number = 0; i < this.images.length; i++ ){

            this.images[i].setImageSelectedStatus(true);
        }
    }

    public setAllImagesToUnselected(){
        
        for ( let i :number = 0; i < this.images.length; i++ ){

            this.images[i].setImageSelectedStatus(false);
        }
    }


    // Description: adds an Image to the album
    // Parameters:  AlbumImage
    // Return:      none
    public addImageToAlbum(albumImage: AlbumImage){

        this.images.push(albumImage);
    }


    // Description: returns the name of the Album object
    // Parameters:  none
    // Return:      string
    public getAlbumImages():AlbumImage[]{
        return this.images;
    } 


    // Description: returns the name of the Album object
    // Parameters:  none
    // Return:      string
    public getAlbumName():string{
        return this.albumName;
    }


    // Description: Returns the directory path for the album
    // Parameters:  none
    // Return:      string
    public getAlbumPath():string{
        return this.albumPath;
    }


    // Description: Returns the last modified date for the album
    // Parameters:  none
    // Return:      none
    public getAlbumLastModified():number{
        return this.lastModified;
    }

    // Description: Returns the last modified date for the album
    // Parameters:  none
    // Return:      none
    public getAlbumThumbnail():AlbumImage{
        return this.albumThumbnail;
    }


    // Description: Returns the last modified date for the album
    // Parameters:  none
    // Return:      none
    public getNumberImagesAlbum(): number{
        return this.images.length;
    }

    public getCurrentImageSortBy():string {
        return this.currentSortBy;
    }

    public setThumbnailPath(thumbnailPath:string){

       this.albumThumbnail.setThumbnailPath(thumbnailPath);
    }


    public getAlbumCoverPath(): string{
        if ( this.albumThumbnail == undefined ){
            
            return null;

        } else{

            return (this.albumThumbnail.getThumbnailPath() + "/" + this.albumThumbnail.getThumbnailName());
        }
    }
}