import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FertilizerRecommendationsComponent } from './fertilizer-recommendations.component';

describe('FertilizerRecommendationsComponent', () => {
  let component: FertilizerRecommendationsComponent;
  let fixture: ComponentFixture<FertilizerRecommendationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FertilizerRecommendationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FertilizerRecommendationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
