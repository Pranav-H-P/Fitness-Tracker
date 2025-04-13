import { Component, inject, Input, signal } from '@angular/core';
import { AppStateService } from '../../../services/app-state.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-nav-button',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './nav-button.component.html',
  styleUrl: './nav-button.component.scss'
})
export class NavButtonComponent {
  
  appStateService = inject(AppStateService);
  @Input() imgSrc = "";
  @Input() subText = "";
  @Input() navLink = "";
  @Input() active = signal<Boolean>(false);

}
