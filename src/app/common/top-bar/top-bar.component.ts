import { Component, inject, signal } from '@angular/core';
import { AppStateService } from '../../services/app-state.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [NgClass],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.scss',
})
export class TopBarComponent {
  stateService = inject(AppStateService);

  titleText = this.stateService.getCurrentPageSignal();

  showSideBar(event: Event) {
    this.stateService.showSideBar();
    event.stopPropagation();
  }
}
