import { AlbumImage } from './../../app/classes/AlbumImage';
import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
  name: 'sortAlbumPipe',
})
export class SortAlbumPipe implements PipeTransform {
  
    private readonly sortNewestToOldest = "newest-oldest";
    private readonly sortOldestToNewest = "oldest-newest";
    private readonly sortFileNameAscending = "a-z";
    private readonly sortFileNameDescending = "z-a";


    transform(array: AlbumImage[], sortBy:string) {

        if ( sortBy == this.sortNewestToOldest){

            let sortedArray: AlbumImage[] = array.sort( (obj1, obj2) => {
                
                if (obj1.getImageLastModified() < obj2.getImageLastModified()) {
                    return 1;
                }
            
                if (obj1.getImageLastModified() > obj2.getImageLastModified()) {
                    return -1;
                }
            
                return 0;
            });

        }else if ( sortBy ==  this.sortOldestToNewest){

            let sortedImages:AlbumImage[] = array.sort( (obj1, obj2) => {
                
                if (obj1.getImageLastModified() > obj2.getImageLastModified()) {
                    return 1;
                }
            
                if (obj1.getImageLastModified() < obj2.getImageLastModified()) {
                    return -1;
                }
            
                return 0;
            });
        }
        

    }
}
