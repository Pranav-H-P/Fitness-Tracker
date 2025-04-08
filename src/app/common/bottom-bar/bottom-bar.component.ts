import { Component, inject } from '@angular/core';
import { AppStateServiceService } from '../../services/app-state-service.service';
import { NavButtonComponent } from '../util/nav-button/nav-button.component';
import { navButtonData } from '../../models';

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
      new navButtonData("dashboard/exercise","assets/images/dumbell_brown_700.svg","Exercise"),
      new navButtonData("dashboard/diet","assets/images/dumbell_brown_700.svg","Diet"),
      new navButtonData("dashboard/graph","assets/images/dumbell_brown_700.svg","Graph")
    ],
    "exercise": [
      new navButtonData("workout/entry","assets/images/dumbell_brown_700.svg","Entry"),
      new navButtonData("workout/create","assets/images/dumbell_brown_700.svg","Create"),
      new navButtonData("workout/logs","assets/images/dumbell_brown_700.svg","Logs")
    ],
    "diet": [
      new navButtonData("diet/tracking","assets/images/dumbell_brown_700.svg","Track"),
      new navButtonData("diet/createfood","assets/images/dumbell_brown_700.svg","Custom Food"),
      new navButtonData("diet/createtemplate","assets/images/dumbell_brown_700.svg","Templates")
    ],
    "settings": [
      new navButtonData("settings/exercise","assets/images/dumbell_brown_700.svg","Exercise"),
      new navButtonData("settings/diet","assets/images/dumbell_brown_700.svg","Diet")
    ]
  }
}
