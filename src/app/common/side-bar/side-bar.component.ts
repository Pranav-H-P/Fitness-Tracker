import { Component, inject, Signal } from '@angular/core';
import { AppStateService } from '../../services/app-state.service';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppSectionState } from '../../eums';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [NgClass, RouterLink],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.scss'
})
export class SideBarComponent {
  stateService = inject(AppStateService);

  visible: Signal<Boolean> = this.stateService.getSideBarStateSignal();

  sideBarElements = [ // [name, routerlink, state]
    ["Dashboard","dashboard/exercise", AppSectionState.DASHBOARD],
    ["Fitness","workout/entry", AppSectionState.EXERCISE],
    ["Diet","diet/tracking", AppSectionState.DIET],
    ["Settings", "settings", AppSectionState.SETTINGS]
    
  ]

  hideSideBar(event: Event){
    this.stateService.hideSideBar();
    event.stopPropagation();
  }
  contentClicked(event: Event){
    event.stopPropagation();
  }
  sectionChangeClicked(state: any){ // no idea why setting to string OR AppSectionState causes compile error
    this.stateService.setAppSectionStateSignal(state)
    this.stateService.hideSideBar();  
  }

}
