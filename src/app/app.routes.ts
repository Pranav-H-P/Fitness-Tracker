import { Routes } from '@angular/router';
import { CreationListPageComponent } from './pages/workout/create/creation-list-page/creation-list-page.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';

export const routes: Routes = [
    {
        path: '',
        component: CreationListPageComponent // change later to dashboard
    },
    {
        path: 'workout/entry',
        component: CreationListPageComponent
    },
    {
        path: '**',
        component: PageNotFoundComponent
    }
];
