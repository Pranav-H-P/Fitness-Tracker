import { Component, inject } from '@angular/core';
import { AppStateService } from '../../services/app-state.service';
import { NavButtonComponent } from '../util/nav-button/nav-button.component';
import { NavButtonData } from '../../models';

@Component({
  selector: 'app-bottom-bar',
  standalone: true,
  imports: [NavButtonComponent],
  templateUrl: './bottom-bar.component.html',
  styleUrl: './bottom-bar.component.scss',
})
export class BottomBarComponent {
  stateService = inject(AppStateService);

  currentState = this.stateService.getAppSectionStateSignal();

  barLayout: { [key: string]: Array<NavButtonData> } = {
    dashboard: [
      {
        navLink: 'dashboard/exercise',
        imgLink: 'assets/images/dumbell_brown_700.svg',
        text: 'Exercise',
      },
      {
        navLink: 'dashboard/diet',
        imgLink: 'assets/images/food.svg',
        text: 'Diet',
      },
      {
        navLink: 'dashboard/graph',
        imgLink: 'assets/images/graph.svg',
        text: 'Graph',
      },
    ],
    exercise: [
      {
        navLink: 'workout/entry',
        imgLink: 'assets/images/entry.svg',
        text: 'Entry',
      },
      {
        navLink: 'workout/create',
        imgLink: 'assets/images/add.svg',
        text: 'Create',
      },
      {
        navLink: 'workout/logs',
        imgLink: 'assets/images/logbook.svg',
        text: 'Logs',
      },
    ],
    diet: [
      {
        navLink: 'diet/tracking',
        imgLink: 'assets/images/entry.svg',
        text: 'Track',
      },
      {
        navLink: 'diet/createfood',
        imgLink: 'assets/images/add.svg',
        text: 'Custom Food',
      },
      {
        navLink: 'diet/createtemplate',
        imgLink: 'assets/images/templates.svg',
        text: 'Templates',
      },
    ],
    settings: [
      {
        navLink: 'settings/exercise',
        imgLink: 'assets/images/dumbell_brown_700.svg',
        text: 'Exercise',
      },
      {
        navLink: 'settings/diet',
        imgLink: 'assets/images/food.svg',
        text: 'Diet',
      },
    ],
  };
}
