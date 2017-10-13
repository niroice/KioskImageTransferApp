import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule, NavController } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

// Custom Imported Components
import { MyApp } from './app.component';
import { ImageSelect } from '../pages/image-select/image-select';

// Custom Imported Services
import { DirectoryService } from '../services/directory-service/directory.service';
import { File } from '@ionic-native/file';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { HttpModule } from '@angular/http';

@NgModule({
  declarations: [
    MyApp,
    ImageSelect,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ImageSelect,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    DirectoryService,
    File,
    HttpModule,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
