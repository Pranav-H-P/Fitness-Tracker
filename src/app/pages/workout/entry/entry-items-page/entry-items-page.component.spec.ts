import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntryItemsPageComponent } from './entry-items-page.component';

describe('EntryItemsPageComponent', () => {
  let component: EntryItemsPageComponent;
  let fixture: ComponentFixture<EntryItemsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntryItemsPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EntryItemsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
