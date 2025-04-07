import { Component, OnInit } from '@angular/core';
import { CropCardComponent } from '../crop-card/crop-card.component';
import { CropService } from '../../Services/crop.service';
import { RouterLink } from '@angular/router';
import { CarouselComponent } from '../../utils/carousel/carousel.component';
import { PulseLoaderComponent } from '../../utils/pulse-loader/pulse-loader.component';


@Component({
  selector: 'app-crop',
  standalone: true,
  imports: [CropCardComponent,RouterLink,CarouselComponent, PulseLoaderComponent],
  templateUrl: './crop.component.html',
  styleUrl: './crop.component.css'
})
export class CropComponent implements OnInit{
  loading: boolean = false;
  constructor(private cropService:CropService){
  }
  products: any[] = [];
  ngOnInit(): void {
    this.getAllCrops();
  }
  getAllCrops():void{
    this.loading = true;
    this.cropService.getAllCrops().subscribe({

      next: (res) => {
        const {products} = res;
        this.products = products;
        this.loading = false;
       
      },
      error: (err) => {
      //  this.toast.danger(err.error.error);
      this.loading = false;
      
      },
      complete: () => {
        this.loading = false;
      }
     
    });
  }
 
}
