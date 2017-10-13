import { Observable, Observer } from 'rxjs/Rx';
import { Component, OnInit, ViewChild, Injectable } from '@angular/core';
import { Platform, Content } from 'ionic-angular';
import { File as IonicFile } from '@ionic-native/file';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable()

export class DirectoryService {

  private readonly thumbnailFolderName:string = ".transpixThumbnail";
  private readonly thumbnailDataFileName:string = ".thumbnailData.tran";
  private readonly thumbnailDataFilePath:string = this.thumbnailFolderName + "/" + this.thumbnailDataFileName;

  // extension types to look for when displaying
  private readonly jpgExtension:string = ".jpg";
  private readonly gifExtension: string = ".gif";
  private readonly pngExtension: string = ".png";
  private readonly tifExtension: string = ".tiff";
  private readonly thumbnailDirectoryIgnore:string = ".thumbnails";
  private readonly thumnailWidth: number = 50;
  private readonly thumnailHeight: number = 38;

  private currentImageProcess:number = 0;

  private mobileOS:string;
  private readonly android:string = 'android';
  private readonly ios:string = "ios";
  private readonly defaultPathAndroid = "DCIM"; // default open location for Android (gallery)
  private readonly defaultPathIOS = "/IOS/"; // default open location for IOS (gallery)
  private directoryPath:string; // path to the directory - excludes the OS root path
  private OSRootPath:string; // root path for the OS

  private directorySubDirectories: {path,name}[] = []; // list of current files and folders in the directory path
  private directoryImages: {name, path, thumbnailName, thumbnailPath}[] = []; // list of current files and folders in the directory path

  private imagesDetailsFoundObserver : Observer<any>;
  private imageDetailsFoundObservable: any;
  private thumbnailLoadObserver : Observer<any>;
  private thumbnailLoadObservable : Observable<any>;

  private thumbnailsGeneratedCount: number = 0;

  private pageSrolling:boolean = false;

  constructor(public fileAccess: IonicFile, private platform: Platform,
     private domSanitizer: DomSanitizer) {
    
      //check transpix thumbnail folder exists on device, if not create it
      this.checkTranspixThumbnailFolderExists();

      // create observable for when directoryImages has load all the image 
      // details
      this.imageDetailsFoundObservable = Observable.create( observer => {
         this.imagesDetailsFoundObserver = observer;
       });

      // create observable for when all the thumbnails have been succesfully created
      this.thumbnailLoadObservable = Observable.create( observer => {
         this.thumbnailLoadObserver = observer;
      });
    
  }
  
  // tempory method used start the process - remove later
  public proccessImages(){
    this.getDirectoryContent();
  }

  // Description: reads a directory's images and sub-directories, stores them in a 
  //              separates array to use later. Any file other then image or directory
  //              is ignored.
  // Parameters:  none
  // Return:      none
  private getDirectoryContent(){
    let images:any[] = [];

    if (this.platform.is(this.ios)){
      
      this.directoryPath = this.defaultPathIOS;
      this.OSRootPath = this.fileAccess.documentsDirectory;
    }
    else if (this.platform.is(this.android)){
      
      this.directoryPath = this.defaultPathAndroid;
      this.OSRootPath = this.fileAccess.externalRootDirectory;
    }

    // wait until platform is ready
    this.platform.ready().then(() => {

      // get the contents of the directory, from directory path
      this.fileAccess.listDir(this.OSRootPath, this.directoryPath).then(
        (files)=>{

          // loop through each file and directory
          for(let i = 0; i < files.length; i++){

            let fileName:string =  files[i].name.toLowerCase(); // make lowercase for extension check

              // check if folder and NOT thumbnail directory, if so copy its path and name
            if (files[i].isDirectory && files[i].name != this.thumbnailDirectoryIgnore){
              this.directorySubDirectories.push({'path': files[i].nativeURL, "name": files[i].name});

              

            } // check if file is a image type, by checking extensions
            else if (fileName.includes(this.jpgExtension) || fileName.includes(this.gifExtension) ||
                      fileName.includes(this.pngExtension) || fileName.includes(this.tifExtension)) {

              images.push(files[i]);
            }
          }
          // once finished getting images and directory files, start
          // processing image name, path and thumbnail name
          this.getImagesDetails(images);
        } 
      ).catch(
        (error) =>{
          console.log("ERROR Reading the directory, code below:");
          console.log(error);
        }
      );
    });

  }
  

  // Description: Retrieves the image files name, path, generates thumbnail name
  //              and stores it into directoryImages object-array for use. Once
  //              all image files have been process return the directoryImages array
  //              as an observable.
  // Parameters:  Files
  // Return:      none
  private getImagesDetails(files:any){
    let metaDataFoundCount:number = 0;

    for (let i = 0; i < files.length; i++){
      files[i].getMetadata((metaData)=>{

        // generate thumbnail name based on name of file and exact time it was created
        let thumbnailName:string = this.generateThumbnailName(files[i].name, 
          metaData);

        // add image image file path, name and thumbnail to directory image array to use later        
        this.directoryImages.push({ 'name': files[i].name, 
        'path': files[i].nativeURL, 
        'thumbnailName': thumbnailName,
        'thumbnailPath': null });

        metaDataFoundCount++;

        if (metaDataFoundCount == files.length)
        {
          // tell any subscribers that directory images has finished loading
          // all images name, path and Thumbnail name
          this.imagesDetailsFoundObserver.next(this.directoryImages);

          // next start processing all thumbnails images to display
          this.processAllThumbnailsImages();
        }
      });
    }
  }


  // Description: Checks that the thumbnail folder exists, if  not creates the folder
  // Parameters:  none
  // Return:      none
  private checkTranspixThumbnailFolderExists(){
    
    // wait until platform is ready
    this.platform.ready().then(() => {

      if (this.platform.is(this.android)){

        // create thumbnail directory
        this.fileAccess.createDir(this.fileAccess.externalRootDirectory, this.thumbnailFolderName, false).then(
          (result)=>{
              console.log(".transpixThumbnail folder created");
          })
          .catch(
            (error) => {
              console.log(".transpixThumbnail folder already exists");
          });
      }
      else{
        // IOS goes here
      }
    });
  }

  // Description: Creates a standard format for a thumbnail's file name using the original
  //              images file name and appending the modification information to the begining of the name.
  //              This ensures that the thumbnail matches the original image and hasnt been
  //              modified since.                      
  // Parameters:  OriginalImageName:string, metaData:any
  // Return:      String
  private generateThumbnailName( OriginalImageName:string, metaData:any):string{

    let modificationTimeValue:string = metaData.modificationTime.valueOf().toString();  

    //remove space from modified date and add the image name
    let thumbnailName:string = modificationTimeValue +  OriginalImageName;

    return thumbnailName;
  }
  

  // Description: Proccesses all thumbnails in the directoryImages array. This means
  //              it checks if thumbnail already exists in the thumbnails folder. If file
  //              exists it adds its path, if the thumbnail does not exist it calls method
  //              to create the thumbnail file.
  // Parameters:  none
  // Return:      none
  private processAllThumbnailsImages(){

    if (this.currentImageProcess < this.directoryImages.length){

      let thumbnailPath: string = this.fileAccess.externalRootDirectory + "/" + this.thumbnailFolderName 
                                  + "/";
      let thumbnailName:string = this.directoryImages[this.currentImageProcess].thumbnailName;

      this.fileAccess.checkFile(thumbnailPath, thumbnailName ).then(
        (found) => {

          // found - add thumbnail path and index location to images to load array
          this.addThumbnailPath(this.currentImageProcess, thumbnailPath, thumbnailName);
          
          this.currentImageProcess ++;
          this.processAllThumbnailsImages();
        }
      ).catch(
        (notFound) =>{

          this.createThumbnailFile(this.currentImageProcess).subscribe(result=> {

            this.currentImageProcess ++;
            this.processAllThumbnailsImages();
        });
      });
    }
  }


  // Description: Creates a thumbnail file using the canvas element and saves
  //              it to transpix thumbnail folder for use later.
  // Parameters:  image: HTMLImageElement, imageIndex:number
  // Return:      none
  private processThumbnailFile(image: HTMLImageElement, imageIndex:number){
    let canvas = document.createElement('canvas');
    let context = canvas.getContext('2d');
    let maxHeight:number = 150; // max height allowed for the thumbnail
    let maxWidth:number = 300; // max width allowed for the thumbnail
    let ratio:number; // ratio used to times by the height and width to get the right proportions
    let thumbnailWidth: number;
    let thumbnailHeight:number;
    let thumbnailName: string = this.directoryImages[imageIndex].thumbnailName;

    // calculate which side is smaller, the height or width and use that ratio to
    // calculate thumbnails sizes
    ratio = Math.min(maxWidth / image.naturalWidth, maxHeight / image.naturalHeight);

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
        thumbnailBlob.name = thumbnailName;

        let folderPath:string = this.OSRootPath + this.thumbnailFolderName;
        console.log("save path = " +folderPath);

        this.fileAccess.writeFile(folderPath, thumbnailName, <File>blob).then(
          (created)=>{
              console.log("thumbnail file succesfully created");
              this.addThumbnailPath(imageIndex, folderPath, thumbnailName);
          },
          (error)=>{
            console.log("thumbnail file not created - error");
          }
        )
      });
  }

  // Description: Creates an observable to create an image object and
  //              sets the orginal image path as the source. Once the image object
  //              has loaded, it will call function to create the thumbnail file, passing
  //              in the image object.
  // Parameters:  index:number
  // Return:      none
  private createThumbnailFile(imageIndex:number) {

    let path:string = this.directoryImages[imageIndex].path;

    return Observable.create((observer: Observer<any>) => {
      let img = new Image();
      img.src = path;
      if (!img.complete) {
        img.onload = () => {
          observer.next(this.processThumbnailFile(img, imageIndex));
          observer.complete();
        };
        img.onerror = (err) => {
          observer.error(err);
        };
      } else {
        observer.next(this.processThumbnailFile(img, imageIndex));
        observer.complete();
      }
    });
  }

  
 

  // Description: Generates the address required to display as background image and
  //              push the path to the directory images array.
  // Parameters:  index:number, ThumbnailPath:string, ThumbnailName
  // Return:      none
  private addThumbnailPath(index:number, thumbnailPath:string, thumbnailName:string){

    let thumbnailLocation:string = "url(" + thumbnailPath + thumbnailName + ')';

    this.directoryImages[index].thumbnailPath = thumbnailLocation;

    this.thumbnailsGeneratedCount++;

    if (this.thumbnailsGeneratedCount == this.directoryImages.length){
      this.thumbnailLoadObserver.next(true);
    }
  }

  

  
  // Description: Returns an observable-object-array with all the images
  //              that are contained in the current directory. Only returns
  //              once all the images name, path and thumbnail name have been
  //              recieved/generated.       
  // Parameters:  path:string
  // Return:      Object[]
  public getDirectoryImages():Observable<any>{
    //return this.directoryImages;
    return this.imageDetailsFoundObservable;
  }

  // Description: Returns a boolean when all the image thumbnails
  //              have been processed and paths available
  // Parameters:  none
  // Return:      Observable<boolean>
  public thumbnailAllProcessedCheck():Observable<any>{
    return this.thumbnailLoadObservable;
  }

  // Description: Returns a javascript object array with sub-directories
  //              that are contained within the directory.
  // Parameters:  none
  // Return:      Object[]
  public getDirectorySubDirectories():Object[]{
    return this.directorySubDirectories;
  }

  // Description: Sets the directory Path the service should load as
  // Parameters:  Path:string
  // Return:      Object[]
  public setReadDirectoryPath(path:string){
    this.directoryPath = path;
  }

}
