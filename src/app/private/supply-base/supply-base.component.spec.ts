import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplyBaseComponent } from './supply-base.component';

describe('SupplyBaseComponent', () => {
  let component: SupplyBaseComponent;
  let fixture: ComponentFixture<SupplyBaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SupplyBaseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplyBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
