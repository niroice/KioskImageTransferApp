import { AlbumService } from './../../services/album-service/album.service';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-album-sort',
  templateUrl: 'album-sort.html',
})
export class AlbumSortPage {

    public currentSortBy:string;

    constructor(public navCtrl: NavController, public navParams: NavParams, public albumService: AlbumService) {
    }

    ionViewDidLoad() {
        this.currentSortBy = this.albumService.getCurrentAlbumSortBy();
    }

}
