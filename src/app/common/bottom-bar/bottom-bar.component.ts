import { Component, inject } from '@angular/core';
import { AppStateServiceService } from '../../services/app-state-service.service';
import { state } from '@angular/animations';
import { NavButtonComponent } from '../util/nav-button/nav-button.component';

@Component({
  selector: 'app-bottom-bar',
  standalone: true,
  imports: [NavButtonComponent],
  templateUrl: './bottom-bar.component.html',
  styleUrl: './bottom-bar.component.scss'
})
export class BottomBarComponent {

  stateService = inject(AppStateServiceService);

  currentState = this.stateService.getAppSectionStateSignal();

  barLayout = {
    "dashboard": [ // add routerlink, image, subtext as object
      "Exercise",
      "Diet",
      "Graph"
      ],
    "exercise": ["Entry", "Create", "Logs"],
    "diet": ["Track", "Custom Food", "Templates"],
    "settings": ["Exercise", "Diet"]
  }
}
