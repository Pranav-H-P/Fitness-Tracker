import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageTabComponent } from './page-tab.component';

describe('PageTabComponent', () => {
  let component: PageTabComponent;
  let fixture: ComponentFixture<PageTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageTabComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PageTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
