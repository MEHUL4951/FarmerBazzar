import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CropCardComponent } from './crop-card.component';

describe('CropCardComponent', () => {
  let component: CropCardComponent;
  let fixture: ComponentFixture<CropCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CropCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CropCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
