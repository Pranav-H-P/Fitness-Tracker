import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopBarComponent } from './common/top-bar/top-bar.component';
import { BottomBarComponent } from './common/bottom-bar/bottom-bar.component';
import { SideBarComponent } from './common/side-bar/side-bar.component';
import { HardwareService } from './services/hardware.service';
import { SplashScreenComponent } from './common/splash-screen/splash-screen.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    TopBarComponent,
    BottomBarComponent,
    SideBarComponent,
    SplashScreenComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'WorkoutTracker';

  constructor(private hardwareService: HardwareService) {}
}
