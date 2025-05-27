export interface NavButtonData {
  navLink: string;
  imgLink: string;
  text: string;
}

export interface ExerciseSetData {
  load: number;
  reps: number;
  timestamp: number;
}

export interface ExerciseEntryData {
  id?: number;
  exerciseName: string;
  timestamp: number;
  sets: Array<ExerciseSetData>;
  note: string;
}

// how much to count towards a set
// eg 1 set of bicep is 1 set for bicep
// 1 set of lat pulldown is 0.5 sets for bicep
export interface FractionalSetRatio {
  muscleName: string;
  ratio: number;
}

export interface Exercise {
  id?: number;
  name: string;
  unit: string;
  musclesHit: Array<FractionalSetRatio>;
}

export interface Metric {
  id?: number;
  name: string;
  unit: string;
  isNumeric: boolean;
  hidden?: boolean; // for read only metrics (diet related stuff that only the app can fill)
}

export interface MetricEntryData {
  id?: number;
  metricName: string;
  entry: string;
  timestamp: number;
  note: string;
}

export interface TabData {
  name: string;
  popupLink: string;
}
