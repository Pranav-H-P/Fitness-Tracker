import { Routes } from '@angular/router';
import { CreationListPageComponent } from './pages/workout/create/creation-list-page/creation-list-page.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { LogPageComponent } from './pages/workout/logs/log-page/log-page.component';
import { EntryItemsPageComponent } from './pages/workout/entry/entry-items-page/entry-items-page.component';
import { ExerciseStatsComponent } from './pages/dashboard/exercise/exercise-stats/exercise-stats.component';
import { DietStatsComponent } from './pages/dashboard/diet/diet-stats/diet-stats.component';
import { GraphPageComponent } from './pages/dashboard/graphs/graph-page/graph-page.component';
import { ExerciseEntryPageComponent } from './pages/workout/entry/exercise-entry-page/exercise-entry-page.component';
import { MetricEntryPageComponent } from './pages/workout/entry/metric-entry-page/metric-entry-page.component';
import { CalendarViewPageComponent } from './pages/workout/logs/calendar-view-page/calendar-view-page.component';
import { ExerciseCreationPageComponent } from './pages/workout/create/exercise-creation-page/exercise-creation-page.component';
import { MetricCreationPageComponent } from './pages/workout/create/metric-creation-page/metric-creation-page.component';
import { ExerciseSettingsComponent } from './pages/settings/exercise-settings/exercise-settings.component';
import { DietSettingsComponent } from './pages/settings/diet-settings/diet-settings.component';
import { DataSettingsComponent } from './pages/settings/data-settings/data-settings.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard/exercise',
    pathMatch: 'full',
  },
  {
    path: 'dashboard/exercise',
    component: ExerciseStatsComponent,
  },
  {
    path: 'dashboard/diet',
    component: DietStatsComponent,
  },
  {
    path: 'dashboard/graph',
    component: GraphPageComponent,
  },
  {
    path: 'workout/entry',
    component: EntryItemsPageComponent,
  },
  {
    path: 'workout/entry/exercise/:id',
    component: ExerciseEntryPageComponent,
  },
  {
    path: 'workout/entry/metric/:id',
    component: MetricEntryPageComponent,
  },
  {
    path: 'workout/create',
    component: CreationListPageComponent,
  },
  {
    path: 'workout/create/exercise/:id',
    component: ExerciseCreationPageComponent,
  },
  {
    path: 'workout/create/metric/:id',
    component: MetricCreationPageComponent,
  },
  {
    path: 'workout/logs',
    component: CalendarViewPageComponent,
  },
  {
    path: 'workout/logs/:date',
    component: LogPageComponent,
  },
  {
    path: 'diet/tracking',
    component: DietStatsComponent,
  },
  {
    path: 'settings/exercise',
    component: ExerciseSettingsComponent,
  },
  {
    path: 'settings/diet',
    component: DietSettingsComponent,
  },
  {
    path: 'settings/data',
    component: DataSettingsComponent,
  },
  {
    path: '**',
    component: PageNotFoundComponent,
  },
];
