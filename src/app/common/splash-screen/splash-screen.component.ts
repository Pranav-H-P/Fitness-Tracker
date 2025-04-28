import { Component, inject, signal } from '@angular/core';
import { DatabaseService } from '../../services/database.service';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-splash-screen',
  standalone: true,
  imports: [],
  templateUrl: './splash-screen.component.html',
  styleUrl: './splash-screen.component.scss',
})
export class SplashScreenComponent {
  visible = signal(true);

  databaseService = inject(DatabaseService);
  dataService = inject(DataService);

  constructor() {
    this.appInitialization();
  }

  async appInitialization() {
    await this.databaseService.initializeDb();
    await this.dataService.updateExerciseList();
    await this.dataService.updateMetricList();

    this.visible.set(false);
  }
}
