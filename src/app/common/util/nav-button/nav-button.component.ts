import { Component, inject, Input, signal } from '@angular/core';
import { AppStateService } from '../../../services/app-state.service';
import { Router, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-nav-button',
  standalone: true,
  imports: [RouterLink, NgClass],
  templateUrl: './nav-button.component.html',
  styleUrl: './nav-button.component.scss',
})
export class NavButtonComponent {
  appStateService = inject(AppStateService);
  router = inject(Router);

  @Input() imgSrc = '';
  @Input() subText = '';
  @Input() navLink = '';
  @Input() active = signal<Boolean>(false);
}
