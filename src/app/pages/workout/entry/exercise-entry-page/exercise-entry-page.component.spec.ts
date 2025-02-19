import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciseEntryPageComponent } from './exercise-entry-page.component';

describe('ExerciseEntryPageComponent', () => {
  let component: ExerciseEntryPageComponent;
  let fixture: ComponentFixture<ExerciseEntryPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExerciseEntryPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExerciseEntryPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
