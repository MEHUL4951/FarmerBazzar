import { Component, OnInit } from '@angular/core';
import { CropCardComponent } from '../crop-card/crop-card.component';
import { CropService } from '../../Services/crop.service';
import { RouterLink } from '@angular/router';
import { CarouselComponent } from '../../utils/carousel/carousel.component';
import { PulseLoaderComponent } from '../../utils/pulse-loader/pulse-loader.component';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-crop',
  standalone: true,
  imports: [CropCardComponent,RouterLink,CarouselComponent, PulseLoaderComponent , CommonModule],
  templateUrl: './crop.component.html',
  styleUrl: './crop.component.css'
})
export class CropComponent implements OnInit{
  loading: boolean = false;
  userId : string | null = null;
  constructor(
    private cropService:CropService
    , private auth: Auth
  ){
  }
  products: any[] = [];
  ngOnInit(): void {
     onAuthStateChanged(this.auth, (user) => {
          if (user) {
            this.userId = user.uid;
            this.getAllCrops();
          } else {
            console.log("No user logged in");
          }
        });
    
  }
  getAllCrops():void{
    this.loading = true;
    this.cropService.getAllCrops().subscribe({

      next: (res) => {
        const {products} = res;
        this.products = this.products = products.filter((product: any) => product.sellerId !== this.userId);;
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
