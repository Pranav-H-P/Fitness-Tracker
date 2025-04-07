import { Component, inject, Signal } from '@angular/core';
import { AppStateServiceService } from '../../services/app-state-service.service';
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
  stateService = inject(AppStateServiceService);

  visible: Signal<Boolean> = this.stateService.getSideBarStateSignal();

  sideBarElements = [ // [name, routerlink, state]
    ["Dashboard","dashboard/home", AppSectionState.DASHBOARD],
    ["Exercise","exercise/entry", AppSectionState.EXERCISE],
    ["Diet","diet/entry", AppSectionState.DIET],
    ["Settings", "settings", AppSectionState.SETTINGS]
    
  ]

  hideSideBar(event: Event){
    this.stateService.hideSideBar();
    console.log("hide")
    event.stopPropagation();
  }
  contentClicked(event: Event){
    console.log("content")
    event.stopPropagation();
  }
  sectionChangeClicked(state: any){ // no idea why setting to string OR AppSectionState causes compile error
    this.stateService.setAppSectionStateSignal(state)
  }

}
