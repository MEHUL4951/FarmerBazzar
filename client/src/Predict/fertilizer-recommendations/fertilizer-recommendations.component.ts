import { Component } from '@angular/core';
import { PredictService } from '../../Services/predict.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-fertilizer-recommendations',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './fertilizer-recommendations.component.html',
  styleUrl: './fertilizer-recommendations.component.css'
})
export class FertilizerRecommendationsComponent {
  cropName = '';
  soilType = '';
  pHLevel: number | null = null;
  climateCondition = '';
  recommendedFertilizer: string | null = null;
  errorMessage: string | null = null;
  isLoading = false;

  // Soil Types and Climate Conditions (From Dataset)
  soilTypes = ['Sandy', 'Clayey', 'Loamy', 'Silty', 'Peaty', 'Chalky'];
  climateConditions = ['Humid', 'Arid', 'Temperate', 'Tropical', 'Cold'];

  constructor(private predictService: PredictService) { }

  getRecommendation() {
    this.errorMessage = null;
    this.recommendedFertilizer = null;
    this.isLoading = true;

    // Input Validation
    if (!this.cropName.trim()) {
      this.setError('Crop Name is required!');
      return;
    }
    if (!this.soilType.trim()) {
      this.setError('Soil Type is required!');
      return;
    }
    if (this.pHLevel === null || this.pHLevel < 0 || this.pHLevel > 14) {
      this.setError('Enter a valid pH level (0-14)!');
      return;
    }
    if (!this.climateCondition.trim()) {
      this.setError('Climate Condition is required!');
      return;
    }

    // Prepare API Request Data
    const requestData = {
      crop_name: this.cropName.trim(),
      soil_type: this.soilType.trim(),
      pH_level: this.pHLevel,
      climate_condition: this.climateCondition.trim()
    };

    // API Call
    this.predictService.FertilizerPredict(requestData).subscribe(
      {
        next: (res) => {
          this.recommendedFertilizer = res.recommended_fertilizer;
          this.isLoading = false;
        },
        error: (err) => {
          this.errorMessage = err.error.error || 'An error occurred!';
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }

      }

    );


  }

  setError(message: string) {
    this.errorMessage = message;
    this.isLoading = false;
  }
}