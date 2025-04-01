import { Component, inject, Signal } from '@angular/core';
import { AppStateServiceService } from '../../services/app-state-service.service';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';

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

  sideBarElements = [ // [name, routerlink]
    ["Dashboard","dashboard/home"],
    ["Exercise","exercise/entry"],
    ["Diet","diet/entry"],
    ["Settings", "settings"]
    
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

}
