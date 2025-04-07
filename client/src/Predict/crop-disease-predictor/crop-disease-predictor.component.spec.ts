import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CropDiseasePredictorComponent } from './crop-disease-predictor.component';

describe('CropDiseasePredictorComponent', () => {
  let component: CropDiseasePredictorComponent;
  let fixture: ComponentFixture<CropDiseasePredictorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CropDiseasePredictorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CropDiseasePredictorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
