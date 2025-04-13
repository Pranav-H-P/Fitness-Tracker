import { Component, inject } from '@angular/core';
import { AppStateService } from '../../services/app-state.service';
import { NavButtonComponent } from '../util/nav-button/nav-button.component';
import { NavButtonData } from '../../models';

@Component({
  selector: 'app-bottom-bar',
  standalone: true,
  imports: [NavButtonComponent],
  templateUrl: './bottom-bar.component.html',
  styleUrl: './bottom-bar.component.scss'
})
export class BottomBarComponent {

  stateService = inject(AppStateService);

  currentState = this.stateService.getAppSectionStateSignal();

  barLayout = {
    "dashboard": [ // add routerlink, image, subtext as object
      new NavButtonData("dashboard/exercise","assets/images/dumbell_brown_700.svg","Exercise"),
      new NavButtonData("dashboard/diet","assets/images/dumbell_brown_700.svg","Diet"),
      new NavButtonData("dashboard/graph","assets/images/dumbell_brown_700.svg","Graph")
    ],
    "exercise": [
      new NavButtonData("workout/entry","assets/images/dumbell_brown_700.svg","Entry"),
      new NavButtonData("workout/create","assets/images/dumbell_brown_700.svg","Create"),
      new NavButtonData("workout/logs","assets/images/dumbell_brown_700.svg","Logs")
    ],
    "diet": [
      new NavButtonData("diet/tracking","assets/images/dumbell_brown_700.svg","Track"),
      new NavButtonData("diet/createfood","assets/images/dumbell_brown_700.svg","Custom Food"),
      new NavButtonData("diet/createtemplate","assets/images/dumbell_brown_700.svg","Templates")
    ],
    "settings": [
      new NavButtonData("settings/exercise","assets/images/dumbell_brown_700.svg","Exercise"),
      new NavButtonData("settings/diet","assets/images/dumbell_brown_700.svg","Diet")
    ]
  }
}
