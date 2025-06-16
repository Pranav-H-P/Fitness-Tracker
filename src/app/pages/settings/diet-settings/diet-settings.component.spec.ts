import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DietSettingsComponent } from './diet-settings.component';

describe('DietSettingsComponent', () => {
  let component: DietSettingsComponent;
  let fixture: ComponentFixture<DietSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DietSettingsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DietSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
