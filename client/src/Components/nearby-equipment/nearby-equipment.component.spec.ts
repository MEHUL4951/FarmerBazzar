import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NearbyEquipmentComponent } from './nearby-equipment.component';

describe('NearbyEquipmentComponent', () => {
  let component: NearbyEquipmentComponent;
  let fixture: ComponentFixture<NearbyEquipmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NearbyEquipmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NearbyEquipmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
