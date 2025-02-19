import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreationListPageComponent } from './creation-list-page.component';

describe('CreationListPageComponent', () => {
  let component: CreationListPageComponent;
  let fixture: ComponentFixture<CreationListPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreationListPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreationListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
