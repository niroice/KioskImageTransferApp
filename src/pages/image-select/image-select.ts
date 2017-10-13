import { DirectoryService } from './../../services/directory-service/directory.service';
import { Component, OnInit, ViewChild, IterableDiffer } from '@angular/core';
import { NavController, Platform, Content } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'page-image-select',
  templateUrl: 'image-select.html'
})
export class ImageSelect implements OnInit  {

  public directoryImages: any[] = []; // list of current files and folders in the directory path
  private directoryImagesLoaded:boolean;
  public directorySubDirectories:any[] = [];
  private readonly numberImagesRefreshLimit: number = 20;
  private referenceCheckIntervalTime: any;


  @ViewChild(Content) content: Content;

  constructor(public navCtrl: NavController, public directoryService: DirectoryService, 
     private ref:ChangeDetectorRef) {
    
  }

  ngOnInit(){
    // this.content.ionScroll.subscribe(($event) => {
    //   console.log("user is scrolling");
    //   this.directoryService.pauseLoadingImages();
    // });

    // this.content.ionScrollEnd.subscribe(($event) => {
    //   console.log("user has stopped scrolling");
    //   setTimeout(()=>{
    //     this.directoryService.resumeLoadingImages();
    //   },2000);
    // });
  }

  public buttonClicked(){
    this.directoryService.proccessImages();
    this.directorySubDirectories = this.directoryService.getDirectorySubDirectories();

    this.directoryService.getDirectoryImages().subscribe((result)=>{
      this.directoryImages = result;
      this.ref.detectChanges();

      this.referenceCheckIntervalTime = setInterval( ()=> {
        this.ref.detectChanges();
      },5000);
    });
  }


}
