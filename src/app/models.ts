export class navButtonData{
    navLink: string;
    imgLink: string;
    text: string;

    constructor(navLink: string, imgLink:string, text:string){
        this.imgLink = imgLink;
        this.navLink = navLink;
        this.text = text;
    }
}