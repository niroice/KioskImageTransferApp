import { ImageGalleryComponent } from './../components/image-gallery/image-gallery';
import { ImageSelectModule } from './../pages/image-select/image-select.module';
import { ComponentsModule } from './../components/components.module';
import { DisplayService } from './../services/display-service/display-service';
import { SortAlbumPipe } from './../pipes/sort-album/sort-album';
import { ImageMenuOptionsComponent } from './../components/image-menu-options/image-menu-options';
import { OptionsPopoverModule } from './../components/options-popup/popover.module';
import { OptionsPopup } from './../components/options-popup/options-popup';
import { IkSelectPage } from './../pages/ik-select/ik-select';
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule, ChangeDetectorRef } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule, NavController, IonicPageModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { MyApp } from './app.component';
import { ImageSelect } from '../pages/image-select/image-select';
import { AlbumsSelectPage } from '../pages/albums-select/albums-select';
import { File } from '@ionic-native/file';
import { HttpModule } from '@angular/http';
import { AlbumService } from './../services/album-service/album.service';
import { ResizeImageService } from './../services/resize-image-service/resize-image-service';
import { AlbumSortPage } from './../pages/album-sort/album-sort';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
    // any componenets (pages and custom components), directives and pipes that application uses - except
    // if already provided by a custom @ngModule under imports
  declarations: [
    MyApp,
    AlbumsSelectPage,
    //ImageSelect,
    //ImageGalleryComponent,
    IkSelectPage,
    AlbumSortPage

  ],
  // import any other @NgMoules that application will use, example pop over ngModule or componenets module
  imports: [
    BrowserModule,
    OptionsPopoverModule,
    ImageSelectModule, // image select page and components
    IonicModule.forRoot(MyApp)
  ],
  // component to be loaded during bootstrap
  bootstrap: [IonicApp],

  // any components (pages only) that will dynamically loaded - do need to add custom components
  entryComponents: [
    MyApp,
    AlbumsSelectPage,
    AlbumSortPage,
    IkSelectPage,
    ImageSelect
  ],
  providers: [
    ResizeImageService,
    AlbumService,
    StatusBar,
    SplashScreen,
    File,
    HttpModule,
    OptionsPopup,
    DisplayService,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
