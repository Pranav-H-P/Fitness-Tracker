import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetricEntryPageComponent } from './metric-entry-page.component';

describe('MetricEntryPageComponent', () => {
  let component: MetricEntryPageComponent;
  let fixture: ComponentFixture<MetricEntryPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetricEntryPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MetricEntryPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
