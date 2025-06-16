import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciseSettingsComponent } from './exercise-settings.component';

describe('ExerciseSettingsComponent', () => {
  let component: ExerciseSettingsComponent;
  let fixture: ComponentFixture<ExerciseSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExerciseSettingsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExerciseSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
