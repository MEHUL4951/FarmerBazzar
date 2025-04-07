import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CropRecommendationsComponent } from './crop-recommendations.component';

describe('CropRecommendationsComponent', () => {
  let component: CropRecommendationsComponent;
  let fixture: ComponentFixture<CropRecommendationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CropRecommendationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CropRecommendationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
