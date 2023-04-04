import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadTableComponent } from './load-table.component';

describe('LoadTableComponent', () => {
  let component: LoadTableComponent;
  let fixture: ComponentFixture<LoadTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoadTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
