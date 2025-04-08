import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DietStatsComponent } from './diet-stats.component';

describe('DietStatsComponent', () => {
  let component: DietStatsComponent;
  let fixture: ComponentFixture<DietStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DietStatsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DietStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
