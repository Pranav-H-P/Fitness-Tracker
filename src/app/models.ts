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
  exerciseId: number;
  timestamp: number;
  sets: Array<ExerciseSetData>;
  note: string;
}

// how much to count towards a set
// eg 1 set of bicep is 1 set for bicep
// 1 set of lat pulldown is 0.5 sets for bicep
export interface FractionalSetRatio {
  muscleId: number;
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
  metricId: number;
  entry: string;
  timestamp: number;
  note: string;
}

export interface TabData {
  name: string;
  popupLink: string;
}

export interface ExerciseLogEntry {
  name: string;
  note?: string;
  sets: Array<ExerciseSetData>;
  unit: string;
}

export interface MetricLogEntry {
  name: string;
  note?: string;
  entry: string;
  unit: string;
}
