import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetricCreationPageComponent } from './metric-creation-page.component';

describe('MetricCreationPageComponent', () => {
  let component: MetricCreationPageComponent;
  let fixture: ComponentFixture<MetricCreationPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetricCreationPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MetricCreationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
