import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { PredictService } from '../../Services/predict.service';

@Component({
  selector: 'app-crop-recommendations',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './crop-recommendations.component.html',
  styleUrls: ['./crop-recommendations.component.css']
})
export class CropRecommendationsComponent {
  cropForm: FormGroup;
  recommendedCrop = '';
  loading = false;
  error = '';
  cropImage = 'assets/croprec.avif'; // Placeholder image
  constructor(private predictService: PredictService) {
    this.cropForm = new FormGroup({
      ph: new FormControl('', [Validators.required, Validators.min(0), Validators.max(14)]),
      temperature: new FormControl('', [Validators.required, Validators.min(-50), Validators.max(60)]),
      rainfall: new FormControl('', [Validators.required, Validators.min(0), Validators.max(500)]),
      humidity: new FormControl('', [Validators.required, Validators.min(0), Validators.max(100)])
    });
  }

  get formControls() {
    return this.cropForm.controls;
  }

  handleSubmit(event: Event) {
    event.preventDefault();
    if (this.cropForm.invalid) {
      return;
    }
    this.loading = true;
    this.error = ''
    this.predictService.CropPredict(this.cropForm.value).subscribe({
      next: (response) => {
        this.recommendedCrop = response.crop;
        switch (this.recommendedCrop) {
          case 'Wheat':
            this.cropImage = './assets/wheat.jpg';
            break;
          case 'rice':
            this.cropImage = './assets/rice.jpg';
            break;
          case 'Barley':
            this.cropImage = './assets/barley.jpg';
            break;
          case 'maize':
            this.cropImage = './assets/maize.jpg';
            break;
          case 'Sugarcane':
            this.cropImage = './assets/sugarcane.avif';
            break;
          case 'pigeonpeas':
            this.cropImage = './assets/pigeonpeas.jpg';
            break
          case 'cotton':
            this.cropImage = './assets/cotton.jpg';
            break;
          case 'banana':
            this.cropImage = './assets/banana.jpg';
            break;
          case 'orange':
            this.cropImage = './assets/orange.jpg';
            break;
          default:
            this.cropImage = './assets/croprec.avif';

        }
      },
      error: (error) => {
        this.error = 'Error fetching recommendation. Please try again.';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  
  }

  handleClear() {
    this.cropForm.reset();
    this.recommendedCrop = '';
    this.error = '';
    this.cropImage = './assets/croprec.avif';
  }
}
