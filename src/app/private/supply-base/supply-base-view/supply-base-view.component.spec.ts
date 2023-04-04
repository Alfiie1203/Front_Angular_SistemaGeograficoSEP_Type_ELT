import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplyBaseViewComponent } from './supply-base-view.component';

describe('SupplyBaseViewComponent', () => {
  let component: SupplyBaseViewComponent;
  let fixture: ComponentFixture<SupplyBaseViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SupplyBaseViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplyBaseViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
