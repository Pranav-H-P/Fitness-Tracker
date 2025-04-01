import { Component, inject, signal } from '@angular/core';
import { AppStateServiceService } from '../../services/app-state-service.service';
import { state } from '@angular/animations';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.scss'
})
export class TopBarComponent {

  stateService = inject(AppStateServiceService);
  
  titleText = this.stateService.getCurrentPageSignal();


showSideBar(event: Event){
  this.stateService.showSideBar();
  event.stopPropagation();
}

}
