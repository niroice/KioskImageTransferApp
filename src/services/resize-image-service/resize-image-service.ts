import { Observable } from 'rxjs/Observable';
import { AlbumImage } from './../../app/classes/AlbumImage';
import { Observer } from 'rxjs/Rx';
import { Component, OnInit, ViewChild, Injectable } from '@angular/core';
import { Platform, Content } from 'ionic-angular';
import { File as IonicFile } from '@ionic-native/file';

@Injectable()

export class ResizeImageService {

    private currentImageProcessCount:number = 0;

    private thumbnailToCreate: { albumImage: AlbumImage, savePath:string, width: number, height: number}[] = [];
    private thumbnailCreateCounter: number = 0;

    private thumbnailresizeObservable: Observable<object[]>;
    private thumbnailresizeObserver: Observer<any>;
    private thumbnailsGeneratedCount: number = 0;
    
    private currentImageCreateAttempts: number = 0;

    private readonly numberImagesAverage: number = 30;
    private timerStart: any;
    private averageResizeTimeMilliseconds: number = 0;
    private resizeAverageObservable: Observable<any>;
    private resizeAverageObserver: Observer<any>;

    private readonly maxResizeAtOnce: number = 5;
    private readonly ExistsErrorCode: number = 12;

    constructor(public fileAccess: IonicFile, private platform: Platform) {
    
        this.thumbnailresizeObservable = Observable.create( observer=>{
        this.thumbnailresizeObserver = observer;

        });    

        this.resizeAverageObservable = Observable.create( observer =>{
            this.resizeAverageObserver = observer;
        });
    }


    public addImageToResizeQueue(obj: { albumImage: AlbumImage, savePath:string, width: number, height: number}) {

        this.thumbnailToCreate.push(obj);

    }

    
    public resizeImageFilesInQueue(): Observable<{}> {

        // check to make sure there are images to procces, if not return error
        if (this.thumbnailToCreate.length > 0){

            this.timerStart = performance.now();

            // start process of resizing four images at time - if there are four
            // image to resize. Else resize number of images in the array (should be less than four)
            if ( this.maxResizeAtOnce < this.thumbnailToCreate.length ){

                for ( let i = 0; i < this.maxResizeAtOnce; i++ ){

                    this.createImageTag(this.thumbnailCreateCounter).subscribe();
                }
            }
            else{

                for ( let i = 0; i < this.thumbnailToCreate.length; i++ ){

                    this.createImageTag(this.thumbnailCreateCounter).subscribe();
                }

            }
            
        }
        else{

            console.log("image-resize - no thumbnails to create");

            this.thumbnailresizeObserver.next(
                { created: false, errorCode: "no-images", error: "No thumbnails to proccess. Use 'addImageToResizeQueue()' to " +
                "add image to be processed." }
            );

            this.thumbnailresizeObserver.complete();
        }
    
        return this.thumbnailresizeObservable;
    }


    // Description: Creates an observable to create an image object and
    //              sets the orginal image path as the source. Once the image object
    //              has loaded, it will call function to create the thumbnail file, passing
    //              in the image object.
    // Parameters:  index:number
    // Return:      none
    private createImageTag(imageIndex: number) {

        this.averageTimeCalculate();

        this.currentImageProcessCount++;
        this.thumbnailCreateCounter++;

        return Observable.create((observer: Observer<any>) => {
            let img = new Image();
            img.src = this.thumbnailToCreate[imageIndex].albumImage.getImagePath();

            if (!img.complete) {
                img.onload = () => {
                observer.next(this.processThumbnailFile(img, imageIndex));
                observer.complete();
                };
                img.onerror = (err) => {
                observer.error(err);
                console.log("error creating image tag");
                this.createImageTag(imageIndex).subscribe();
                
                };
            } else {
                observer.next(this.processThumbnailFile(img, imageIndex));
                observer.complete();
            }
        });
    }




  // Description: Creates a thumbnail file using the canvas element and saves
  //              it to the nominated folder
  // Parameters:  image: HTMLImageElement
  // Return:      none
  private processThumbnailFile(image: HTMLImageElement, imageIndex:number){

    let canvas = document.createElement('canvas');
    let context = canvas.getContext('2d');
    let ratio:number; // ratio used to times by the height and width to get the right proportions
    let thumbnailWidth: number;
    let thumbnailHeight:number;


    // calculate which side is smaller, the height or width and use that ratio to
    // calculate thumbnails sizes
    ratio = Math.min( this.thumbnailToCreate[imageIndex].width / image.naturalWidth, 
                      this.thumbnailToCreate[imageIndex].height / image.naturalHeight);

    // times the ratio by the image natural height to get the correct width and height
    thumbnailWidth = image.naturalWidth * ratio;
    thumbnailHeight = image.naturalHeight * ratio;

    // set the canvas dimensions to the thumbnail dimensions - so nothing is cropped or 
    // extra whitespace of black is added
    canvas.height = thumbnailHeight;
    canvas.width = thumbnailWidth;

    // set the image to thumbnail size - so there is no black spacing
    image.height =  thumbnailHeight;
    image.width  = thumbnailWidth;

    // draw the image tags image onto the canvas
    context.drawImage(image, 0, 0, thumbnailWidth, thumbnailHeight);

    // create blob from canvas, save to file and then add to thumbnail directory
    let thumbnailBlob: any = canvas.toBlob(
      (blob) =>{

        let thumbnailBlob:any = blob;
        thumbnailBlob.lastModifiedDate = new Date();
        thumbnailBlob.name = this.thumbnailToCreate[imageIndex].albumImage.getThumbnailName();

        this.fileAccess.writeFile(this.thumbnailToCreate[imageIndex].savePath, 
        this.thumbnailToCreate[imageIndex].albumImage.getThumbnailName(), <File>blob).then(
            (success)=>{

                let thumbnailSavePath: string = this.thumbnailToCreate[imageIndex].savePath;

                // return the thumbnail creation result to calling subscriber
                this.thumbnailresizeObserver.next(
                    { created: true, 
                        thumbnailName: this.thumbnailToCreate[imageIndex].albumImage.getThumbnailName(),
                        thumbnailLocation: thumbnailSavePath,
                        originalImageLocation: this.thumbnailToCreate[imageIndex].albumImage.getImagePath()
                    }
                );
                
                this.thumbnailToCreate[imageIndex].albumImage.setThumbnailPath(thumbnailSavePath)
                
                this.checkMoreImagesToCreate();
            },
            (error)=>{

                let thumbnailSavePath: string = this.thumbnailToCreate[imageIndex].savePath;
                
                // if file already exists, remove from array and start next image
                if (error.code == this.ExistsErrorCode){

                    this.thumbnailToCreate[imageIndex].albumImage.setThumbnailPath(thumbnailSavePath);

                    this.checkMoreImagesToCreate();
                }
                // if failed to create - not due to existing - retry again up to 4 times
                else{

                    // retry creatign image - if attempted less then 4 times
                    if (this.currentImageCreateAttempts < 4){

                        console.log("error creating thumbnail - attempting to retry");

                        this.currentImageCreateAttempts++;

                        this.createImageTag(imageIndex).subscribe();

                    }
                    // if errors persist creating file skip this image and remove
                    else{

                        this.currentImageCreateAttempts = 0;

                        this.checkMoreImagesToCreate();
                    }
                }
            }
        )
      }
    );
  }

    private checkMoreImagesToCreate(){

        this.currentImageProcessCount--; // as image as finished set count to minus one

        // if there are more images to create continue
        if( this.thumbnailCreateCounter < this.thumbnailToCreate.length ){
            
            this.createImageTag(this.thumbnailCreateCounter).subscribe();
        }
        // if there is no more images being currently processed and none to create set observer to complete
        else if ( this.currentImageProcessCount == 0 ){
            
            this.thumbnailresizeObserver.next({completed: true})
            this.thumbnailresizeObserver.complete();

            // reset all counters and array back to default
            this.thumbnailToCreate = [];
            this.thumbnailCreateCounter = 0;
            this.currentImageProcessCount = 0;
        }
    }

    private averageTimeCalculate(){

        if ( this.numberImagesAverage == this.thumbnailCreateCounter ){

            this.averageResizeTimeMilliseconds = Math.ceil(( performance.now() - this.timerStart) / this.numberImagesAverage);
            this.resizeAverageObserver.next(this.averageResizeTimeMilliseconds);
            this.resizeAverageObserver.complete();
        }
    }

    public getAverageResize():Observable<any>{
        return this.resizeAverageObservable;
    }

    public getNumberImagesToBeProccessed(): number{

        return this.thumbnailToCreate.length - this.thumbnailCreateCounter;
        
    }

    

}
