
export class AlbumImage{

    private name :string;
    private path :string; 
    private lastModified :number;
    private thumbnailName : string; 
    private thumbnailPath : string;
    private thumbnailFullPath: string = "url(\"../assets/images/image-icon.png\")"; 
    private selected: boolean = false;
    private thumbnailExists: boolean = false;

    constructor(name:string, path:string, lastModified: number){
        this.name = name;
        this.path = path;
        this.lastModified = lastModified;
        this.thumbnailName = this.generateThumbnailName(this.name, this.lastModified);
    }

    public setThumbnailPath(thumbnailPath:string){
        this.thumbnailPath = thumbnailPath;
        this.thumbnailFullPath = "url(\'" + thumbnailPath + "/" + this.thumbnailName + "\')";

    }

    public changeThumbnailName(name:string){
        this.thumbnailName = name;
    }

    public setImageSelectedStatus(selected: boolean){
        this.selected = selected;
    }

    public getImageFileName():string{
        return this.name;
    }

    public getImagePath():string{
        return this.path;
    }

    public getImageLastModified():number{
        return this.lastModified;
    }

    public getThumbnailName():string{
        return this.thumbnailName;
    }

    public getThumbnailPath():string{
        return this.thumbnailPath;
    }

    public getSelectedStatus():Boolean{
        return this.selected;
    }

    public setThumbnailFound(){
        this.thumbnailExists = true;
    }

    public getThumbnailFullPath():string{
        return this.thumbnailFullPath;
        
    }

    public checkThumbnailExistsStatus():boolean{
        return this.thumbnailExists;
    }

    // Description: Creates a standard format for a thumbnail's file name using the original
    //              images file name and appending the modification information to the begining of the name.
    //              This ensures that the thumbnail matches the original image and hasnt been
    //              modified since.                      
    // Parameters:  OriginalImageName:string, metaData:any
    // Return:      String
    private generateThumbnailName( OriginalImageName:string, lastModified: number):string{
    
        //remove space from modified date and add the image name
        let thumbnailName:string = lastModified +  OriginalImageName;
    
        return thumbnailName;
    }
}