import { NgModule } from '@angular/core';
import { SortAlbumPipe } from './sort-album/sort-album';
@NgModule({
	declarations: [SortAlbumPipe,
    SortAlbumPipe],
	imports: [],
	exports: [SortAlbumPipe,
    SortAlbumPipe]
})
export class PipesModule {}
