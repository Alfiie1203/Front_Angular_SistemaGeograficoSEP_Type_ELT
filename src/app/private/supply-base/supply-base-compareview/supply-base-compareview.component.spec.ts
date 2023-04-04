import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplyBaseCompareviewComponent } from './supply-base-compareview.component';

describe('SupplyBaseCompareviewComponent', () => {
  let component: SupplyBaseCompareviewComponent;
  let fixture: ComponentFixture<SupplyBaseCompareviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SupplyBaseCompareviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplyBaseCompareviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
