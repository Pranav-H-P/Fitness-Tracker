import { Component, inject, Signal } from '@angular/core';
import { AppStateService } from '../../services/app-state.service';
import { NgClass } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AppSectionState } from '../../eums';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [NgClass],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.scss',
})
export class SideBarComponent {
  stateService = inject(AppStateService);
  router = inject(Router);

  visible: Signal<Boolean> = this.stateService.getSideBarStateSignal();

  sideBarElements = [
    // [name, routerlink, state, icon]
    [
      'Dashboard',
      'dashboard/exercise',
      AppSectionState.DASHBOARD,
      'assets/images/dashboard.svg',
    ],
    [
      'Fitness',
      'workout/entry',
      AppSectionState.EXERCISE,
      'assets/images/dumbell_brown_700.svg',
    ],
    ['Diet', 'diet/tracking', AppSectionState.DIET, 'assets/images/food.svg'],
    [
      'Settings',
      'settings',
      AppSectionState.SETTINGS,
      'assets/images/settings.svg',
    ],
  ];

  hideSideBar(event: Event) {
    this.stateService.hideSideBar();
    event.stopPropagation();
  }
  contentClicked(event: Event) {
    event.stopPropagation();
  }
  sectionChangeClicked(ind: number) {
    this.stateService.setAppSectionStateSignal(
      this.sideBarElements[ind][2] as AppSectionState
    );
    this.stateService.hideSideBar();
    this.router.navigateByUrl(this.sideBarElements[ind][1]);
  }
}
