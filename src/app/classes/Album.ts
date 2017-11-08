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

    constructor(name:string, path:string, numberImages:number, lastModified: number){

        this.albumName = name;
        this.albumPath = path;
        this.numberImages = numberImages;
        this.lastModified = lastModified;
    }

    // // Description: Sets the album cover images based on the four lastest images
    // // Parameters:  none
    // // Return:      none
    // public setAlbumCover(){

    //     let numberThumbnailsRequired:number = 4;

    //     this.sortImagesByModifiedDescending; // sort album by modified date first

    //     // if album contains less then 4 images use that value instead to set
    //     // get images for album cover
    //     if (this.images.length < numberThumbnailsRequired){

    //         numberThumbnailsRequired = this.images.length;
    //     }

    //     // check images are available
    //     if (this.images.length < 1){
    //         throw Error("AlbumImage - setAlbumCover() - No images currently set, add the images before setting the cover.");
    //     }
    //     else{
    //         // sort array from latest to oldest
    //         this.sortImagesByModifiedAscending();
        
    //         // get the 4 latest image and copy into album thumbnails for use
    //         for (let i = 0; i < numberThumbnailsRequired; i++){
    
    //             this.albumThumbnails.push(this.images[i]);
    //         }
    //     }
    // }

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
            this.sortImagesByModifiedAscending();
        
            // set the thumbnail as first element - recreate so its pass by value instead of reference
            this.albumThumbnail = new AlbumImage(
                this.images[0].getImageFileName(),
                this.images[0].getImagePath(),
                this.images[0].getImageLastModified()
            );
        }
    }


    // Description: Sorts all the current images loaded by Descending order when
    //              they where last modified.
    // Parameters:  none
    // Return:      none
    public sortImagesByModifiedDescending(){

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
    }



    // Description: Sorts all the current images loaded by Ascending order when
    //              they where last modified.
    // Parameters:  none
    // Return:      none
    public sortImagesByModifiedAscending(){

        let sortedImages:AlbumImage[] = this.images.sort( (obj1, obj2) => {
            
            if (obj1.getImageLastModified() < obj2.getImageLastModified()) {
                return 1;
            }
        
            if (obj1.getImageLastModified() > obj2.getImageLastModified()) {
                return -1;
            }
        
            return 0;
        });

        this.images = sortedImages;
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

    // public setThumbnailPathByName(thumbnailName:string, thumbnailPath:string){

    //     for (let i = 0; i < this.albumThumbnails.length; i++){

    //         if (thumbnailName = this.albumThumbnails[i].getThumbnailName()){

    //             this.albumThumbnails[i].setThumbnailPath(thumbnailPath);
    //         }
    //     }
    // }

    public setThumbnailPath(thumbnailPath:string){

       this.albumThumbnail.setThumbnailPath(thumbnailPath);
    }

    // public setThumbnailPathByIndex(index:number, thumbnailPath:string){
        
    //     this.albumThumbnails[index].setThumbnailPath(thumbnailPath);
            
    // }

    public getAlbumCoverPath(): string{
        if ( this.albumThumbnail == undefined ){
            
            return null;

        } else{

            return (this.albumThumbnail.getThumbnailPath() + "/" + this.albumThumbnail.getThumbnailName());
        }
    }
}