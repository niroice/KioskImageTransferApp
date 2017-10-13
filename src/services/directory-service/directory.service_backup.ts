import { Component, OnInit, ViewChild, Injectable } from '@angular/core';
import { Platform, Content } from 'ionic-angular';
import { File as IonicFile } from '@ionic-native/file';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Http } from '@angular/http';

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
  private ImagePutOnScreen:number = 0;

  private mobileOS:string;
  private readonly android:string = 'android';
  private readonly ios:string = "ios";
  private readonly defaultPathAndroid = "DCIM"; // default open location for Android (gallery)
  private readonly defaultPathIOS = "/IOS/"; // default open location for IOS (gallery)
  private directoryPath:string; // path to the directory - excludes the OS root path
  private OSRootPath:string; // root path for the OS
  private imagesToLoad: any[] = [];
  private directorySubDirectories: {path,name}[] = []; // list of current files and folders in the directory path
  private directoryImages: {name, path, modifiedDate, originalSize, thumbnailPath}[] = []; // list of current files and folders in the directory path
  
  
  private thumbnailDataFile: {directoryObject}[] = [];

  private directoryFoundInFile:boolean = false; // siginals wether directory was found in thumbnail data file

  private selectedImage: {path, name, url}[] = []; // selected images by the user are stored here
  private selectedImageCount: number = 0;
  private pageSrolling:boolean = false;
  @ViewChild(Content) content: Content;

  constructor(public fileAccess: IonicFile, private platform: Platform,
     private domSanitizer: DomSanitizer, private http: Http) {
    
      //check transpix thumbnail folder exists on device, if not create it
      this.checkTranspixThumbnailExists();
    
  }
    
  public proccessImages(){
    this.getDirectoryContent();
  }

  // Description: reads a directory's image and folder paths and put it into directoryContent array. Requires 
  //              a path specificed to load from.
  // Parameters:  path:string
  // Return:      none
  private getDirectoryContent(){

    let OSRootPath:string;

    if (this.platform.is(this.ios)){
      
      this.directoryPath = this.defaultPathIOS;
      OSRootPath = this.fileAccess.documentsDirectory;
    }
    else if (this.platform.is(this.android)){
      
      this.directoryPath = this.defaultPathAndroid;
      OSRootPath = this.fileAccess.externalRootDirectory;
    }

    // wait until platform is ready
    this.platform.ready().then(() => {

      // get the contents of the directory, from directory path
      this.fileAccess.listDir(OSRootPath, this.directoryPath).then(
        (result)=>{

          // loop through each file and directory
          for(let file of result){

              let fileName:string =  file.name.toLowerCase(); // make lowercase for extension check

              // get orginal images modifed data to save - used to determine if new thumbnail image will be
              // generated
              file.getMetadata((metaData)=>{
                console.log(metaData.modificationTime);
                // check if folder and NOT thumbnail directory, if so copy its path and name
              if (file.isDirectory && file.name != this.thumbnailDirectoryIgnore){
                this.directorySubDirectories.push({'path': file.nativeURL, "name": file.name});

              } // check if file is a image type, by checking extensions
              else if (fileName.includes(this.jpgExtension) || fileName.includes(this.gifExtension) ||
                        fileName.includes(this.pngExtension) || fileName.includes(this.tifExtension)) {

                  // add image image file path and name to directory image array to use later        
                  this.directoryImages.push({ 'name': file.name, 
                                              'path': file.nativeURL, 
                                              'modifiedDate': metaData.modificationTime.toDateString, 
                                              'originalSize': metaData.size, 
                                              'thumbnailPath': ''});   
              }
              });

              
          }
          console.log(this.directoryImages);
          // next start processing all the image paths into thumbnailPath thumbnails - needs
          // to be done here to make sure paths have been all gathered.
          // this.getBase64ImageFromURL().subscribe(thumbnailBase64 =>{
          //   let safeBase64:any = this.domSanitizer.bypassSecurityTrustStyle("url(" + thumbnailBase64 + ')');
          //   this.imagesToLoad.push(safeBase64);
            
          // }); 
          // console.log(this.directoryImages);
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

  private checkTranspixThumbnailExists(){
    
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

        // create thumbnail data file if doesnt exist

        let savePath:string = this.fileAccess.externalRootDirectory + "/" + this.thumbnailFolderName + "/";
        this.fileAccess.createFile(savePath, this.thumbnailDataFileName, false).then(
          (result) => {
            console.log("thumbnail data file created");
          }
        ).catch(
          (error) =>{
            console.log("thumbnail data file already exists");

            // get the data file
            this.http.get(this.thumbnailDataFilePath)
              .subscribe( file => { 

                // save file content into object
                this.thumbnailDataFile = JSON.parse(file.json());

                // look for directory in array
                //if (this.thumbnailDataFile.)

              });
              
            
          
            
          }
        );
      }
      else{
        // IOS goes here
      }
    });
  }

  private generateRandomID(){
    return new Date().valueOf().toString(36) + Math.random().toString(36).substr(2);
  }

  // Description: Saves the thumbnailDateFile object-array to thumbnail data file         
  // Parameters:  none
  // Return:      none
  private saveToThumbnailDataFile(){

      let savePath:string = this.OSRootPath + "/" + this.thumbnailFolderName + "/";

      this.fileAccess.writeExistingFile(savePath, this.thumbnailDataFileName, 
        JSON.stringify(this.thumbnailDataFile)).then(
        (result) => {
          console.log("thumbnail file saved");
        }
      ).catch(
        (error) =>{
          console.log("thumbnail file could not be saved - error");
      });
  }

  // Description: Checks if the thumbnail folder exists           
  // Parameters:  path:string
  // Return:      Object[]
  private checkFolderThumbnails(){

  }

  public makeTrustedImage(url):any{
    let thumbnailStyle = 'url(' + url + ')';
    return this.domSanitizer.bypassSecurityTrustStyle(thumbnailStyle);
  }

  private getBase64ImageFromURL() {
    // get path for current image that need to to be proccessed based on the current
    // count
    let path:string = this.directoryImages[this.currentImageProcess].path;

    return Observable.create((observer: Observer<string>) => {
      let img = new Image();
      img.src = path;
      if (!img.complete) {
        img.onload = () => {
          observer.next(this.processBase64Thumbnail(img));
          observer.complete();
        };
        img.onerror = (err) => {
          observer.error(err);
        };
      } else {
        observer.next(this.processBase64Thumbnail(img));
        observer.complete();
      }
    });
  }
  
  private processBase64Thumbnail(image: HTMLImageElement){
    let canvas = document.createElement('canvas');
    let context = canvas.getContext('2d');
    let maxHeight:number = 150; // max height allowed for the thumbnail
    let maxWidth:number = 300; // max width allowed for the thumbnail
    let ratio:number; // ratio used to times by the height and width to get the right proportions
    let thumbnailWidth: number;
    let thumbnailHeight:number;

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

    this.currentImageProcess++;

    // Start processing the next image, if there is one in the images array
    if (this.currentImageProcess < this.directoryImages.length){

      this.getBase64ImageFromURL().subscribe(thumbnailBase64 =>{

        let safeBase64:any = this.domSanitizer.bypassSecurityTrustStyle("url(" + thumbnailBase64 + ')');
        this.imagesToLoad.push(safeBase64);

        // if page is not scrolling and images still to load - keep loading images to screen
        if (this.pageSrolling == false && this.imagesToLoad.length > 1){
      
          // loop through each image and put to the screen
          for (let i = 0; i < this.imagesToLoad.length; i++){
    
            // check again to see if not scrolling so it doesnt effect user scrolling aciton
            if (this.pageSrolling == false){
    
              this.directoryImages[this.ImagePutOnScreen].thumbnailPath = this.imagesToLoad[i];
              this.imagesToLoad.splice(i, 1); // remove image from array
              this.ImagePutOnScreen++;
            }
          }
        }
      }); 
    }
    else{
      // no more images to process to thumbnailPath - show all to screen
      for (let i = 0; i < this.imagesToLoad.length; i++){

          this.directoryImages[this.ImagePutOnScreen].thumbnailPath = this.imagesToLoad[i];
          this.ImagePutOnScreen++;
      }

      // remove all images from images to load
      this.imagesToLoad = [];
    }

    // return the new thumbnail thumbnailPath
    return canvas.toDataURL("image/jpeg");

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
