export class NavButtonData{
    navLink: string;
    imgLink: string;
    text: string;

    constructor(navLink: string, imgLink:string, text:string){
        this.imgLink = imgLink;
        this.navLink = navLink;
        this.text = text;
    }
}

export interface ExerciseSetData{
    weight: string;
    reps: string;
    timestamp: Date;
}

export interface ExerciseEntryData{
    exerciseName: string;
    currentData: Array<ExerciseSetData>;
    note: string;
}

// how much to count towards a set
// eg 1 set of bicep is 1 set for bicep
// 1 set of lat pulldown is 0.5 sets for bicep
export interface FractionalSetRatio{ 
    muscleName: string;
    ratio: number;
}

export interface Exercise{
    name: string;
    unit: string;
    musclesHit: Array<FractionalSetRatio>;

}

export interface Metric{
    name: string;
    unit: string;
    isNumeric: boolean;
}

export interface MetricEntryData{
    metricName: string;
    entryData: string;
}