import { OptionsPopup } from './../components/options-popup/options-popup';
import { IkSelectPage } from './../pages/ik-select/ik-select';
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule, ChangeDetectorRef } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule, NavController } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

// Custom Imported Components
import { MyApp } from './app.component';
import { ImageSelect } from '../pages/image-select/image-select';
import { AlbumsSelectPage } from '../pages/albums-select/albums-select';
//import { AlbumSortPage } from './../pages/album-sort/album-sort';

// Custom Imported Services
import { File } from '@ionic-native/file';
import { HttpModule } from '@angular/http';
import { AlbumService } from './../services/album-service/album.service';
import { ResizeImageService } from './../services/resize-image-service/resize-image-service';
import { AlbumSortPage } from './../pages/album-sort/album-sort';

@NgModule({
  declarations: [
    MyApp,
    AlbumsSelectPage,
    ImageSelect,
    IkSelectPage,
    AlbumSortPage,
    OptionsPopup,
    
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
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
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
