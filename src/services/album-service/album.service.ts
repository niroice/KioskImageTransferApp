import { Observable } from 'rxjs/Observable';
import { AlbumImage } from './../../app/classes/AlbumImage';
import { Album } from './../../app/classes/Album';
import { ResizeImageService } from './../resize-image-service/resize-image-service';
import { Observer } from 'rxjs/Rx';
import { Component, OnInit, ViewChild, Injectable } from '@angular/core';
import { Platform, Content } from 'ionic-angular';
import { File as IonicFile } from '@ionic-native/file';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    //providers: [ResizeImageService]
  })

@Injectable()

export class AlbumService {

    private mobileOS:string;
    private readonly android:string = 'android';
    private readonly ios:string = "ios";
    private readonly defaultPathAndroid = "DCIM"; // default open location for Android (gallery)
    private readonly defaultPathIOS = "/IOS/"; // default open location for IOS (gallery)
    private directoryPath:string; // path to the directory - excludes the OS root path
    private OSRootPath:string; // root path for the OS
    private readonly defaultFilePath:string = "file:///";
    private readonly thumbnailFolderName:string = ".transpixThumbnail";
    private readonly albumsFolderName:string = "albums";
    private readonly errorCodeExists:number = 12;

    private readonly jpgExtension:string = ".jpg";
    private readonly gifExtension: string = ".gif";
    private readonly pngExtension: string = ".png";
    private readonly tifExtension: string = ".tiff";

    private albumsMetaFoundCount: number = 0;

    private thumbnailWidth: number;
    private thumbnailHeight: number;
    private albumThumbnailWidth: number;
    private albumThumbnailHeight: number;
    private numberThumbnailsPerRow: number = 4;
    private readonly heightRatio:number = .75;

    private checkDirectoryObservable: Observable<any>;
    private checkDirectoryObserver: Observer<any>;

    private foundAlbumsObservable: Observable<any>;
    private foundAlbumsObserver: Observer<any>;

    private generatedImageThumbnailsObservable: Observable<any>;
    private generatedImageThumbnailsObserver: Observer<any>;

    private firstTimeRun: boolean = true;

    private testNumberthumbnails: number = 0;

    private albumSortBy:string;

    private albums: Album[] = [];

    private gettingImageMeta:boolean = false;

    private resizeTime: any;
    private resizeTimeObservable: Observable<any>;
    private resizeTimeObserver: Observer <any>;
    private currentlyResizingCheck: boolean = false;

    private directoriesToCheck: { name:string, 
                                    path:string,
                                    fileObj:any
                                }[]= []; // list of directories to check for images

    private selectedAlbumIndex: number =  null;
    

    constructor(  private fileAccess: IonicFile, private platform: Platform, 
                    private resizeImageService: ResizeImageService) {



        this.calculateThumbnailResolutions();

        this.checkDirectoryObservable = Observable.create( observer =>{
            this.checkDirectoryObserver = observer;
        });

        this.foundAlbumsObservable = Observable.create( observer =>{
            this.foundAlbumsObserver = observer;
        });

        this.generatedImageThumbnailsObservable = Observable.create( observer => {
            this.generatedImageThumbnailsObserver = observer;
        });

        this.resizeTimeObservable = Observable.create( observer => {
            this.resizeTimeObserver = observer;
        });
        
    }

    private calculateThumbnailResolutions(){

        // calculate album thumbnail size based on width of the screen
        this.albumThumbnailWidth = Math.ceil(window.screen.width);
        this.albumThumbnailHeight = Math.ceil(this.albumThumbnailWidth * this.heightRatio);

        // calculate directory thumbnails width and height based on screen resolution
        this.thumbnailWidth = Math.ceil(window.screen.width / this.numberThumbnailsPerRow);
        this.thumbnailHeight = Math.ceil(this.thumbnailWidth * this.heightRatio);

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

                this.checkAlbumFolderExists();
            })
            .catch(
                (error) => {

                this.checkAlbumFolderExists();
            });

           
        }
        else{
            // IOS goes here
        }
        });
    }

    public checkAlbumFolderExists(){

         this.fileAccess.createDir( (this.fileAccess.externalRootDirectory + this.thumbnailFolderName),
            this.albumsFolderName, false).then(
        (result)=>{
            
            this.FindAlbums();
            this.checkDirectoryObserver.next(true);
        })
        .catch(
            (error) => {
            
            this.FindAlbums();
            this.checkDirectoryObserver.next(true);
        });
    }


    public processAlbums(): Observable<any>{
        this.determainDefaultPaths();
        return this.foundAlbumsObservable;
    }

    private determainDefaultPaths(){
    
        // wait until platform is ready
        this.platform.ready().then(() => {

        if (this.platform.is(this.ios)){
            
            this.directoryPath = this.defaultPathIOS;
            this.OSRootPath = this.fileAccess.documentsDirectory;
        }
        else if (this.platform.is(this.android)){
            
            this.directoryPath = this.defaultPathAndroid;
            this.OSRootPath = this.fileAccess.externalRootDirectory;
        }

        this.checkTranspixThumbnailFolderExists();
        //this.FindAlbums();

        // this.checkDirectoryObserver.next(true);
         });
    }

    private FindAlbums(){

        this.checkDirectoryObservable.subscribe( () =>{

        // if service has just been called look in the root path first
        if (this.firstTimeRun == true){
        
            // get directory path by removing default file path "file:///"
            let fileName = this.OSRootPath.replace(this.defaultFilePath, '');

            this.checkDirectoryIsAlbum(this.defaultFilePath, fileName, null);
            this.firstTimeRun = false;
        }
        // if no more directories to check stop the observer and return album details
        else if (this.directoriesToCheck.length == 0){

            // stop checking directories
            this.checkDirectoryObserver.complete();

            
            let timer:any =  setInterval( () =>{
                if (this.gettingImageMeta == false){

                    // create thumbnails image/s for album preview
                    this.generateAlbumsCoverthumbnails();

                    clearInterval(timer);
                }
            }, 500);
        }
        else{

            // decode URI for path and name so the name can be removed from path
            let decodePath:string = decodeURIComponent(this.directoriesToCheck[0].path);
            let decodeName:string = decodeURIComponent(this.directoriesToCheck[0].name);

            let directoryPath:string = decodePath.substring((decodePath.length - decodeName.length -1), 0);

            // check first element in the directories to check is album
            this.checkDirectoryIsAlbum(directoryPath, decodeName, 
                this.directoriesToCheck[0].fileObj);
        
            // remove the element as its being checked
            this.directoriesToCheck.splice(0,1);
        }
        });
    }

    // Description: Reads a directory and checks if it contains images, as well as adds any sub-directory
    //              to directoryToCheck for checking later. All direcory found to have images is added
    //              as an new album object and images saved as AlbumImage object inside the album.
    // Parameters:  OSPath, directoryPath, directoryName, Directoryfile: any
    // Return:      none
    private checkDirectoryIsAlbum(directoryPath, directoryName, Directoryfile: any){

        let numberImagesFound: number = 0;

        let directoryImageFiles: any[] = [];
    
        // wait until platform is ready
        this.platform.ready().then(() => {
        

        // get the contents of the directory, from directory path
        this.fileAccess.listDir(directoryPath, directoryName).then(
            (files)=>{

            // loop through each file and directory
            for(let i = 0; i < files.length; i++){

                let fileName:string =  files[i].name.toLowerCase(); // make lowercase for extension check

                // check if folder and NOT a hidden directory, if so copy its path and name
                if (files[i].isDirectory && files[i].name.charAt(0) != "." && 
                files[i].name != "Android"  && files[i].name != "Music"){

                    //let directoryName:string =  files[i].name.replace(" ", "%");

                    this.directoriesToCheck.push({
                    name: decodeURIComponent(files[i].name),
                    path : decodeURIComponent(files[i].nativeURL),
                    fileObj: files[i]
                });

                } // check if file is a image type, by checking extensions
                else if (fileName.includes(this.jpgExtension) || fileName.includes(this.gifExtension) ||
                        fileName.includes(this.pngExtension) || fileName.includes(this.tifExtension)) {

                    numberImagesFound++;

                    // push image file into array, use at end at add to album and get meta data
                    directoryImageFiles.push(files[i]);
                }
            }

            // if directory contains images
            if (numberImagesFound > 0){
                
                // get folder meta data, then process images and add to album
                Directoryfile.getMetadata((metaData)=>{

                    let modifiedTime: number = <number>metaData.modificationTime.valueOf();

                    let album = new Album( directoryName, directoryPath, numberImagesFound, modifiedTime);
                    
                    this.albums.push(album);
                    
                    this.addImagesToAlbum(this.albums.length -1, directoryImageFiles);
                });
            }

            // once complete checking directory - tell observer to start the next directory
            this.checkDirectoryObserver.next(true);
            } 
        ).catch(
            (error) =>{
            console.log("-----------------------------------------------------------------------------" );
            console.log("ERROR Reading the directory, code below:");
            console.log(error);
            console.log("directory name= " + directoryName);
            console.log("directory path =" + directoryPath);
            console.log("-----------------------------------------------------------------------------" );
            
            // continue checking even if error reading
            this.checkDirectoryObserver.next(true);
            }
        );
        });
    }

    private addImagesToAlbum(albumIndex: number, directoryImageFiles:any){

        let metaDataFoundCount: number = 0;

        this.gettingImageMeta = true;

        for ( let i = 0; i < directoryImageFiles.length; i++){

            directoryImageFiles[i].getMetadata((metaData)=>{

                metaDataFoundCount++
                // create new album image, set thumbnail path and add to the album
                let image = new AlbumImage( 
                    decodeURIComponent(directoryImageFiles[i].name), 
                    decodeURIComponent(directoryImageFiles[i].nativeURL), 
                    <number>metaData.modificationTime.valueOf());
            
                this.albums[albumIndex].addImageToAlbum(image);

                // if this is the last meta data to be found for albums images
                // set the images for the album cover - NOT generating thumbnails yet
                if (metaDataFoundCount == directoryImageFiles.length){

                    this.albums[albumIndex].setAlbumCover();

                    this.gettingImageMeta = false;
                }
            });
        }
    }


    private generateAlbumsCoverthumbnails(){

        let thumbnailsCreatedCount: number = 0;
        
        for ( let i = 0; i < this.albums.length; i++){
            
            let albumThumbnail = this.albums[i].getAlbumThumbnail();
            
                this.testNumberthumbnails++;

                this.resizeImageService.addImageToResizeQueue({
                    albumImage: this.albums[i].getAlbumThumbnail(),
                    savePath: this.OSRootPath + this.thumbnailFolderName + "/" + this.albumsFolderName,
                    width: this.albumThumbnailWidth,
                    height: this.albumThumbnailHeight
                });
        }

        if (this.resizeImageService.getNumberImagesToBeProccessed() > 0 ){

            this.resizeImageService.resizeImageFilesInQueue().subscribe( result => {

                if ( result["completed"] != undefined && result["completed"] == true){

                    // this.foundAlbumsObserver.next({
                    //     status: 'albums-generated'
                    // });

                     this.checkImageThumbnailsExist();
                    // this.foundAlbumsObserver.complete();
                }
            });

        }else {

            // this.foundAlbumsObserver.next({
            //     status: 'albums-generated'
            // });

            this.checkImageThumbnailsExist();
           // this.foundAlbumsObserver.complete();
        }
    }

    private checkImageThumbnailsExist(){

        let numberImagesToCheck: number = 0;
        let numberImagesChecked: number = 0;

        // determain how many images there are in total to check
        for (let i= 0; i < this.albums.length; i++){

            numberImagesToCheck += this.albums[i].getAlbumImages().length;
        }

        // loop through each album and check thumbnails exist, if not add to thumbnail 
        // create queue
        for (let i= 0; i < this.albums.length; i++){

            let albumImages: AlbumImage[] =  this.albums[i].getAlbumImages();

            for (let j = 0; j < albumImages.length; j++){

                let image: AlbumImage = albumImages[j];

                let path :string = this.OSRootPath + this.thumbnailFolderName + "/";

                this.fileAccess.checkFile(path, image.getThumbnailName()).then( result =>{
                    
                    image.setThumbnailPath(this.OSRootPath + this.thumbnailFolderName);

                    numberImagesChecked++;

                    // if this is the last image to be checked start resizing the thumbnails
                    if  (numberImagesChecked == numberImagesToCheck ){
                        
                        this.foundAlbumsObserver.next({
                            status: 'albums-generated'
                        });

                        this.foundAlbumsObserver.complete();
                    }
                },
                (error) => {

                    numberImagesChecked++;

                    this.resizeImageService.addImageToResizeQueue({
                        albumImage: image,
                        savePath: this.OSRootPath + this.thumbnailFolderName,
                        width: this.thumbnailWidth,
                        height: this.thumbnailHeight
                    });

                    // if this is the last image to be checked start resizing the thumbnails
                    if  (numberImagesChecked == numberImagesToCheck ){
                        
                        this.foundAlbumsObserver.next({
                            status: 'albums-generated'
                        });

                        this.foundAlbumsObserver.complete();
                    }
                });
            }
        }
    }
    

    public generateMissingThumbnails(): Observable<Object> {
        
        this.resizeAllImageThumbnailsInQueue();

        return this.generatedImageThumbnailsObservable;
    }
        

    private resizeAllImageThumbnailsInQueue(){

        let countImagesResizedTest: number = 0;
        
        if (this.resizeImageService.getNumberImagesToBeProccessed() > 0 ){
        
            this.currentlyResizingCheck = true;

            this.resizeImageService.resizeImageFilesInQueue().subscribe( result => {
                
                countImagesResizedTest++;
                
                if ( result["completed"] != undefined && result["completed"] == true){

                    this.currentlyResizingCheck = false;

                    // once  creating thumbnails tell subscriber finished
                    this.generatedImageThumbnailsObserver.next( { proccessedThumbnails: true, albums: this.albums } );
                    this.generatedImageThumbnailsObserver.complete();
                }
                else if (  result['errorCode'] != undefined && result['errorCode'] == "no-images"){

                    this.currentlyResizingCheck = false;

                    // once completed creating thumbnails tell subscriber finished
                    this.generatedImageThumbnailsObserver.next( { proccessedThumbnails: true, albums: this.albums } );
                    this.generatedImageThumbnailsObserver.complete();
                }
            });

        } else {
            
            this.currentlyResizingCheck = false;

            this.generatedImageThumbnailsObserver.next( { proccessedThumbnails: true, albums: this.albums } );
            this.generatedImageThumbnailsObserver.complete();
        }
    }

    private calculateResizeTime() {

        if (this.currentlyResizingCheck == true ){
            let numberImagesResizeBeginning: number = this.resizeImageService.getNumberImagesToBeProccessed();
            let numberImagesResizeCurrent: number;
            let numberImagesResized: number;
            let timePeriod: number = 4000;

            setTimeout( ()=> {
                numberImagesResizeCurrent = this.resizeImageService.getNumberImagesToBeProccessed();
                numberImagesResized =  numberImagesResizeBeginning -  numberImagesResizeCurrent;
                this.resizeTime = timePeriod / numberImagesResized;

                console.log("album.service / numberImagesResizeCurrent = " + numberImagesResizeCurrent);
                console.log("album.service / numberImagesResizeBeginning = " + numberImagesResizeBeginning);
                console.log("album.service / numberImagesResizeCurrent = " + numberImagesResizeCurrent);
                console.log("album.service / numberImagesResized = " + numberImagesResized);
                console.log("album.service / this.resizeTime = " + this.resizeTime);

                this.resizeTimeObserver.next({ averageResizeTime: this.resizeTime});
                this.resizeTimeObserver.complete();

            }, timePeriod)

        }else{

            this.resizeTimeObserver.next({ error: "no-images-resizing"});
            this.resizeTimeObserver.complete();
        }
    }

    public getNumberThumbnailToGenerate(): number {
        return this.resizeImageService.getNumberImagesToBeProccessed();
    }

    public getAlbum(albumIndex: number){
        return this.albums[albumIndex]
    }

    public getCurrentAlbumSortBy(){
        return this.albumSortBy;
    }

    public getAlbums(): Album[]{
        return this.albums;
    }

    public sortCurrentAlbumByNameAscending(){

    }

    public sortCurrentAlbumByNameDescending(){
        
    }

    public sortCurrentAlbumByNewestToOldest(){
        
    }

    public sortCurrentAlbumByOldestToNewest(){
        
    }

 
}
