import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PredictService } from '../../Services/predict.service';

@Component({
  selector: 'app-crop-disease-predictor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './crop-disease-predictor.component.html',
  styleUrl: './crop-disease-predictor.component.css'
})
export class CropDiseasePredictorComponent {
  errorMessage: string = "";
  selectedImage: any;
  confidence: number = 0;
  predictionResult: string = '';
  isLoading: boolean = false;
  img: any = '';
  constructor(private predictService: PredictService) { }


  onFileSelected(event: any) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.errorMessage = ''; // Clear previous error message
    this.img = file; // Store the selected file for later use
    if (file) {

      const allowedTypes = ['image/png', 'image/jpeg','image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        this.errorMessage = "Only PNG and JPG images are allowed.";
        this.img = null;
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedImage = reader.result as string; // Set the image preview URL
      };
      reader.readAsDataURL(file); // Convert file to base64
    }
  }

  getRecommendation(): void {
    const formdata = new FormData();
    if (!this.img) {
      this.errorMessage = "Please select an image first";
      return;
    }
    formdata.append('image', this.img); // Append the selected file to FormData
    this.isLoading = true; // Show loading spinner
    this.predictionResult = ''; // Clear previous prediction result
    this.errorMessage = ''; // Clear previous error message
    this.predictService.predictCropDisease(formdata).subscribe({
      next: (res) => {
        this.predictionResult = res.predicted_class
        this.confidence = res.confidence
          ;
        this.isLoading = false;
        // this.selectedImage = null; // Clear the image after prediction
      },
      error: (err) => {
        this.errorMessage = err.error.error
        this.isLoading = false;
        // this.selectedImage = null; // Clear the image after prediction
      },
      complete: () => {
        this.isLoading = false; // Hide loading spinner when request completes
      }
    }

    )


  }
}
