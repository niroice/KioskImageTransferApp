import { Component, OnInit, ViewChild, Injectable } from '@angular/core';
import { NavController, Platform, Content } from 'ionic-angular';
import { File as IonicFile } from '@ionic-native/file';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { DomSanitizer } from '@angular/platform-browser';
import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';

@Injectable()

export class DirectoryService implements OnInit {

  public test: any;
  public test2: any;
  public foundDirectory:string;
  public resultTest:any;
  public errorCode:any;

  private readonly thumbnailFolderName:string = ".transpixThumbnail";

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
  public browseStartPath:string;
  private imagesToLoad: any[] = [];
  public directorySubDirectories: {path,name}[] = []; // list of current files and folders in the directory path
  public directoryImages: {path,name, base64}[] = []; // list of current files and folders in the directory path


  private selectedImage: {path, name, url}[] = []; // selected images by the user are stored here
  public selectedImageCount: number = 0;
  private pageSrolling:boolean = false;
  @ViewChild(Content) content: Content;

  constructor(public navCtrl: NavController, public fileAccess: IonicFile, private platform: Platform, 
    private camera: Camera, private domSanitizer: DomSanitizer) {
    
      //check transpix thumbnail folder exists on device, if not create it
      this.checkTranspixThumbnailExists();
    
  }

  // used to run functions that require angular 2 components/html to be loaded first
  ngOnInit(){
    this.content.ionScroll.subscribe(($event) => {
      console.log("user is scrolling");
      
      this.pageSrolling = true;
    });

    this.content.ionScrollEnd.subscribe(($event) => {
      console.log("user has stopped scrolling");
      setTimeout(()=>{
        this.pageSrolling = false;
      },2000);
      
    });
  }
    
  public proccessImages(){
    this.determainOS(); 
  }

  // Description: Determines the operating system and the default location to look for images
  // Parameters:  none
  // Return:      none
  private determainOS(){
    if (this.platform.is(this.ios)){
      // add getDirectoryContentIOS(this.defaultPathIOS);
    }
    else if (this.platform.is(this.android)){
      this.mobileOS = this.android;
      this.getDirectoryContentAndroid(this.defaultPathAndroid);

      console.log("called before getBase64Images()");
     
    }
  }

  // Description: reads a directory's image and folder paths and put it into directoryContent array. Requires 
  //              a path specificed to load from.
  // Parameters:  path:string
  // Return:      none
  private getDirectoryContentAndroid(path:string){

    // wait until platform is ready
    this.platform.ready().then(() => {

      // get the contents of the directory, from the path provided
      this.fileAccess.listDir(this.fileAccess.externalRootDirectory, path).then(
        (result)=>{

          // loop through each file and directory
          for(let file of result){

              let fileName:string =  file.name.toLowerCase(); // make lowercase for extension check

              file.getMetadata((metaData)=>{
                console.log(metaData.modificationTime);
              });

              // check if folder and NOT thumbnail directory, if so copy its path and name
              if (file.isDirectory && file.name != this.thumbnailDirectoryIgnore){
                this.directorySubDirectories.push({'path': file.nativeURL, "name": file.name});

              } // check if file is a image type, by checking extensions
              else if (fileName.includes(this.jpgExtension) || fileName.includes(this.gifExtension) ||
                        fileName.includes(this.pngExtension) || fileName.includes(this.tifExtension)) {

                  // add image image file path and name to directory image array to use later        
                  this.directoryImages.push({'path': file.nativeURL, 'name': file.name, 'base64': ''});   
              }
          }

          // next start processing all the image paths into base64 thumbnails - needs
          // to be done here to make sure paths have been all gathered.
          this.getBase64ImageFromURL().subscribe(thumbnailBase64 =>{
            let safeBase64:any = this.domSanitizer.bypassSecurityTrustStyle("url(" + thumbnailBase64 + ')');
            this.imagesToLoad.push(safeBase64);
            
          }); 
          console.log(this.directoryImages);
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
    
              this.directoryImages[this.ImagePutOnScreen].base64 = this.imagesToLoad[i];
              this.imagesToLoad.splice(i, 1); // remove image from array
              this.ImagePutOnScreen++;
            }
          }
        }
      }); 
    }
    else{
      // no more images to process to base64 - show all to screen
      for (let i = 0; i < this.imagesToLoad.length; i++){

          this.directoryImages[this.ImagePutOnScreen].base64 = this.imagesToLoad[i];
          this.ImagePutOnScreen++;
      }

      // remove all images from images to load
      this.imagesToLoad = [];
    }

    // return the new thumbnail base64
    return canvas.toDataURL("image/jpeg");

  }

  // Description: adds image to the selectedImages array 
  // Parameters:  none
  // Return:      none
  private addImage(){

  }

  // Description: removes an image from the selectedImages array 
  // Parameters:  none
  // Return:      none
  private removeImage(){

  }

  // Description: removes image select panel from the screen
  // Parameters:  none
  // Return:      none
  private closePanel(){

  }
  
  // Description: Returns the selected Images' path and file name
  // Parameters:  none
  // Return:      none  
  private getSelectedImages():{path, name}[]{
    return this.selectedImage;
  }

}
