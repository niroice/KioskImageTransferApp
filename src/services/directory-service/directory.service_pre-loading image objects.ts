import { Component, OnInit, ViewChild, Injectable } from '@angular/core';
import { Platform, Content } from 'ionic-angular';
import { File as IonicFile } from '@ionic-native/file';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

@Injectable()

export class DirectoryService {

  public foundDirectory:string;
  public errorCode:any;

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
  private imagesCurrentlyLoading :number = 0;
  private readonly imagesAllowedProcess = 20;

  private mobileOS:string;
  private readonly android:string = 'android';
  private readonly ios:string = "ios";
  private readonly defaultPathAndroid = "DCIM"; // default open location for Android (gallery)
  private readonly defaultPathIOS = "/IOS/"; // default open location for IOS (gallery)
  private directoryPath:string; // path to the directory - excludes the OS root path
  private OSRootPath:string; // root path for the OS
  private imagesToLoad: {thumbnailPath, directoryIndex}[] = [];
  private directorySubDirectories: {path,name}[] = []; // list of current files and folders in the directory path
  private directoryImages: {name, path, thumbnailName, thumbnailPath}[] = []; // list of current files and folders in the directory path
  private thumbnailDataFile: any; // list of current files and folders in the directory path

  private directoryFoundInFile:boolean = false; // siginals wether directory was found in thumbnail data file

  private selectedImage: {path, name, url}[] = []; // selected images by the user are stored here
  private selectedImageCount: number = 0;
  private pageSrolling:boolean = false;
  @ViewChild(Content) content: Content;

  constructor(public fileAccess: IonicFile, private platform: Platform,
     private domSanitizer: DomSanitizer) {
    
      //check transpix thumbnail folder exists on device, if not create it
      this.checkTranspixThumbnailFolderExists();
    
  }
    
  public proccessImages(){
    this.getDirectoryContent();
  }

  // Description: reads a directory's image and folder paths and put it into directoryContent array. Requires 
  //              a path specificed to load from.
  // Parameters:  path:string
  // Return:      none
  private getDirectoryContent(){
    let files:any;

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

              files[i].getMetadata((metaData)=>{
                  
                // generate thumbnail name based on name of file and exact time it was created
                let thumbnailName:string = this.generateThumbnailName(files[i].name, 
                  metaData);

                // add image image file path, name and thumbnail to directory image array to use later        
                this.directoryImages.push({ 'name': files[i].name, 
                'path': files[i].nativeURL, 
                'thumbnailName': thumbnailName,
                'thumbnailPath': 'url(' + thumbnailName + ')'});
        
                if (i == (files.length - 1)){
                  // run next function
                  console.log("finished loading meta data");
                  console.log(this.directoryImages);

                  this.processAllThumbnailsImages(); 
                }
              });
            }
          }
        }
      ).catch(
        (error) =>{
          console.log("ERROR Reading the directory, code below:");
          console.log(error);
          this.foundDirectory = "Error didnt find directory";
          this.errorCode =  error;
        }
      );
    });

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

  // Description: creates a standard format for a thumbnail's file name using the original
  //              images file name and appending the modification information to the begining.
  //              this ensures that the thumbnail matches the original image and hasnt been
  //              modified since.                      
  // Parameters:  none
  // Return:      none
  private generateThumbnailName( OriginalImageName:string, metaData:any):string{

    let modificationTimeValue:string = metaData.modificationTime.valueOf().toString();  

    //remove space from modified date and add the image name
    let thumbnailName:string = modificationTimeValue +  OriginalImageName;

    return thumbnailName;
  }
  

  // Description: Proccesses all thumbnails in the directoryImages array. This means
  //              it checks if thumbnail already exists in the thumbnails folder. If file
  //              exists it adds its path, if the thumbnail does not exist it creates a thumbnail
  //              file in the folder.                         
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

          // create a thumbnail image
          this.createThumbnailFile(this.currentImageProcess).subscribe(result=> {

            this.currentImageProcess ++;
            this.processAllThumbnailsImages();
        });
      });
    }
  }


  public makeTrustedImage(url):any{
    let thumbnailStyle = 'url(' + url + ')';
    return this.domSanitizer.bypassSecurityTrustStyle(thumbnailStyle);
  }


  private createThumbnailFile(imageIndex:number) {
    // get path for current image that need to to be proccessed based on the current
    // count

    console.log("create thumnail file called");

    let path:string = this.directoryImages[imageIndex].path;

    return Observable.create((observer: Observer<string>) => {
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

  
  private processThumbnailFile(image: HTMLImageElement, imageIndex:number):any{
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
    return null;
  }

  // Description: loads the thumbnail image path and index position in directoryImages array
  //              into imagesToLoad array. Once images to load reaches 20 images it will push
  //              the thumbnail path to directoryImages array. Designed to improve loading of images.          
  // Parameters:  path:string
  // Return:      Object[]
  private addThumbnailPath(index:number, thumbnailPath:string, thumbnailName:string){

    //let thumbnailLocation:string = "url(" + thumbnailPath + thumbnailName + ')';
    let thumbnailLocation:string =  thumbnailPath + thumbnailName;
    let imagesLoadLength: number;

    this.imagesToLoad.push({thumbnailPath: thumbnailLocation, directoryIndex: index});

    this.checkImagesToLoad();
  }

  private checkImagesToLoad(){
    let imagesLoadLength:number = this.imagesToLoad.length;

    // check to make sure current images loading is not exeeding allowed number
    if (this.imagesCurrentlyLoading < this.imagesAllowedProcess){

      let numberToProcess:number = this.imagesAllowedProcess - this.imagesCurrentlyLoading;
      console.log("images allowed to process = " + this.imagesAllowedProcess);
      console.log("images currently loading = " + this.imagesCurrentlyLoading);
      console.log("number to process = " + numberToProcess);

      if (numberToProcess < this.imagesToLoad.length){

        for (let i = 0; i < numberToProcess; i++){

              this.imagesCurrentlyLoading++;
              this.thumbnailLoad(this.imagesToLoad[i].thumbnailPath).subscribe( (result)=> {
              console.log("thumbnail image loaded and ready to use");

            });
            this.imagesToLoad.splice(i, 1); // remove the element so its not reprocessed again
        }
      }
      // if imagesToLoad contains less thumbnails to process then allowed process; process the rest
      else{
        for (let i = 0; i < this.imagesToLoad.length; i++){

            this.imagesCurrentlyLoading++;
            this.thumbnailLoad(this.imagesToLoad[i].thumbnailPath).subscribe( (result)=> {
            console.log("thumbnail image loaded, not many to go!!");

          });

          this.imagesToLoad.splice(i, 1); // remove the element so its not reprocessed again
        }
      }
    }
  }

  private thumbnailLoad(imagePath:string) {

    return Observable.create((observer: Observer<any>) => {
      let img = new Image();
      img.src = imagePath;
      if (!img.complete) {
        img.onload = () => {
          this.imagesCurrentlyLoading--;
          observer.next(this.checkImagesToLoad());
        };
        img.onerror = (err) => {
          observer.error(err);
        };
      } else {
        this.imagesCurrentlyLoading--;
        observer.next(this.checkImagesToLoad());
      }
    });
  }

  
  // Description: Returns the javascript object array with directories images' full image path,
  //              name and thumbnail path           
  // Parameters:  path:string
  // Return:      Object[]
  public getDirectoryImages():Object[]{
    return this.directoryImages;
  };

  // Description: Returns the javascript object array with directories images' full image path,
  //              name and thumbnail path           
  // Parameters:  path:string
  // Return:      Object[]
  public getDirectorySubDirectories():Object[]{
    return this.directorySubDirectories;
  };

  public pauseLoadingImages(){
    this.pageSrolling = true;
  }

  public resumeLoadingImages(){
    this.pageSrolling = false;
  }

  public setReadDirectoryPath(path:string){
    this.directoryPath = path;
  }

}
