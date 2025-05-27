
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CropService } from '../../Services/crop.service';
import { NgToastService } from 'ng-angular-popup';
import { EquipmentService } from '../../Services/equipment.service';
import { Router } from '@angular/router';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'app-sell-crop',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './sell-crop.component.html',
  styleUrl: './sell-crop.component.css'
})

export class SellCropComponent implements OnInit {
  sellCropForm!: FormGroup;
  img: string | null = null;
  latitude = 22.3072; // Default: Gujarat
  longitude = 73.1812;
  constructor(private fb: FormBuilder, private cropService: CropService, private toast: NgToastService,
    private equipmentService: EquipmentService,
    private router: Router,
  ) { }

  onFileChange(event: any): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {

      const reader = new FileReader();
      reader.onload = () => {
        this.img = reader.result as string; // Set the image preview URL
      };
      reader.readAsDataURL(file); // Convert file to base64
    }


  }


  ngOnInit(): void {
    this.sellCropForm = this.fb.group({
      productName: ['', Validators.required],
      productPrice: [null, [Validators.required, Validators.min(1)]],
      productDescription: ['', Validators.required],
      productCategory: ['', Validators.required],
      productQuantity: [null, [Validators.required, Validators.min(1)]],
      quantityUnit: ['kg', Validators.required],
      sellerMobile: ['', Validators.required],
      sellerAddress: ['', Validators.required],
      availableFrom: ['', Validators.required],
      sellerLatitude: [null],
      sellerLongitude: [null],
      productImage: [null]
    });
  }

  onSubmit(): void {
    if (this.sellCropForm.valid) {
      this.sellCropForm.patchValue({
        productImage: this.img
      })
      this.convertAddressToCoordinates().subscribe({
        next: () => {
          this.cropService.AddCrop(this.sellCropForm.value).subscribe({
            next: (data) => {
              this.toast.success(data.message);
            },
            error: (error) => {
              this.toast.danger(error.error.message || 'Internal Server Error..');
            },


          });

        },
        error: (err) => {
          this.toast.danger("erorr occur during convert convertAddressToCoordinates")
        }
      })
      // this.sellCropForm.reset()
    } else {
      this.toast.danger('Please fill all the fields');
    }
  }

  convertAddressToCoordinates(): Observable<void> {
    const address = this.sellCropForm.get('sellerAddress')?.value;
    return this.equipmentService.getCoordinates(address).pipe(
      map((coords) => {
        this.sellCropForm.patchValue({
          sellerLatitude: coords.latitude,
          sellerLongitude: coords.longitude
        });

      })
    );
  }
}

