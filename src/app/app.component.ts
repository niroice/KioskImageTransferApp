import { AlbumService } from './../services/album-service/album.service';
import { AlbumsSelectPage } from './../pages/albums-select/albums-select';
import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, 
    private albumService: AlbumService) {

    platform.ready().then(() => {

        // Okay, so the platform is ready and our plugins are available.
        // Here you can do any higher level native things you might need.
        statusBar.styleDefault();
        
        // call album service to generate albums first before showing 
        // the albums page
        this.albumService.processAlbums().subscribe( result =>{

            console.log(" Album processing complete, hide splash screen now.");
            this.rootPage = AlbumsSelectPage;
            splashScreen.hide();
        });
        
    });
  }
}

