import { Routes } from '@angular/router';
import { CreationListPageComponent } from './pages/workout/create/creation-list-page/creation-list-page.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { LogPageComponent } from './pages/workout/logs/log-page/log-page.component';
import { EntryItemsPageComponent } from './pages/workout/entry/entry-items-page/entry-items-page.component';
import { ExerciseStatsComponent } from './pages/dashboard/exercise/exercise-stats/exercise-stats.component';
import { DietStatsComponent } from './pages/dashboard/diet/diet-stats/diet-stats.component';
import { GraphPageComponent } from './pages/dashboard/graphs/graph-page/graph-page.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'dashboard/exercise',
        pathMatch:"full"
    },
    {
        path: 'dashboard/exercise',
        component: ExerciseStatsComponent
    },
    {
        path: 'dashboard/diet',
        component: DietStatsComponent
    },
    {
        path: 'dashboard/graph',
        component: GraphPageComponent
    },
    {
        path: 'workout/entry',
        component: EntryItemsPageComponent
    },
    {
        path: 'workout/create',
        component: CreationListPageComponent
    },
    {
        path: 'workout/logs',
        component: LogPageComponent
    },
    {
        path: 'diet/tracking',
        component: DietStatsComponent
    },
    {
        path: '**',
        component: PageNotFoundComponent
    }
];
