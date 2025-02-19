import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarViewPageComponent } from './calendar-view-page.component';

describe('CalendarViewPageComponent', () => {
  let component: CalendarViewPageComponent;
  let fixture: ComponentFixture<CalendarViewPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarViewPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CalendarViewPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
