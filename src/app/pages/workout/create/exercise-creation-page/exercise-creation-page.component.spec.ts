import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciseCreationPageComponent } from './exercise-creation-page.component';

describe('ExerciseCreationPageComponent', () => {
  let component: ExerciseCreationPageComponent;
  let fixture: ComponentFixture<ExerciseCreationPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExerciseCreationPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExerciseCreationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
