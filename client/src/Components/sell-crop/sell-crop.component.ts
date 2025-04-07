
import { CommonModule } from '@angular/common';
import {Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CropService } from '../../Services/crop.service';
import { NgToastService } from 'ng-angular-popup';
import { MapComponent } from '../../utils/map/map.component';
import { EquipmentService } from '../../Services/equipment.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-sell-crop',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule,MapComponent],
  templateUrl: './sell-crop.component.html',
  styleUrl: './sell-crop.component.css'
})

export class SellCropComponent implements OnInit {
  sellCropForm!: FormGroup;
  img: string | null = null;
  latitude = 22.3072; // Default: Gujarat
  longitude = 73.1812;
  constructor(private fb: FormBuilder,private cropService:CropService, private toast:NgToastService,
    private equipmentService:EquipmentService,
    private router:Router,
  
  ) {}

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
    this.getUserLocation()
    this.sellCropForm = this.fb.group({
      productName: ['', Validators.required],
      productPrice: [null, [Validators.required, Validators.min(1)]],
      productDescription: ['', Validators.required],
      productCategory: ['', Validators.required],
      productQuantity: [null, [Validators.required, Validators.min(1)]],
      quantityUnit: ['kg', Validators.required],
      sellerMobile : ['',Validators.required],
      sellerAddress: ['', Validators.required],
      availableFrom: ['', Validators.required],
      sellerLatitude: [''],
      sellerLongitude: [''],
    });
  }

  onSubmit(): void {
    if (this.sellCropForm.valid) {
    const data = {
      productImage: this.img,
      ...this.sellCropForm.value 
    }
      this.cropService.AddCrop(data).subscribe({
        next: (data) => {
          this.toast.success(data.message);
        },
        error: (error) => {
          this.toast.danger(error.error.message || 'Internal Server Error..');
        },
       

      });
      this.sellCropForm.reset()
    } else {
      this.toast.danger('Please fill all the fields');
    }
  }
  getAddressFromCoordinates(): void {
    this.equipmentService.getVillageFromCoordinates(this.latitude, this.longitude).subscribe({
      next: (response) => {
        // console.log('Village:', response.address.village);
        // this.sellCropForm.patchValue({sellerAddress:response.address});
      },
      error: (error) => console.error('Error getting village:', error)
    });
  }
  getUserLocation():void{
    this.equipmentService.getCurrentLocation().subscribe({
      next: (res)=>{
        this.latitude = res.latitude
        this.longitude = res.longitude
        this.sellCropForm.patchValue({ sellerLatitude: this.latitude, sellerLongitude: this.longitude });
      },
      error:(err)=>{

      },
      complete:()=>{

      }
    })
  }
  updateLocation(event:any):void {
    this.latitude = event.lat;
    this.longitude = event.lng;
    this.getAddressFromCoordinates()
    this.sellCropForm.patchValue({ sellerLatitude: this.latitude, sellerLongitude: this.longitude });
  }
}

