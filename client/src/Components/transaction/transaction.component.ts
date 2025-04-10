

import { Component } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CropCardComponent } from '../crop-card/crop-card.component';
import { RouterLink } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import { CropService } from '../../Services/crop.service';

@Component({
  selector: 'app-transaction',
  standalone: true,
  imports: [CommonModule, FormsModule, CropCardComponent, RouterLink],
  templateUrl: './transaction.component.html',
  styleUrl: './transaction.component.css'
})
export class TransactionComponent {

  pendingProducts: any[] = [];
  soldProducts: any[] = [];
  userId: string | null = null;
  isDropdownOpen = false;
  isSoldDropdownOpen = false;

  constructor(
    private productService: CropService,
    private auth: Auth,
    private toast:NgToastService
  ) {}

  ngOnInit(): void {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.userId = user.uid;
        this.loadProducts();
      } else {
        console.log("No user logged in");
      }
    });
  }

  loadProducts() {
    if (!this.userId) return;

    this.productService.GetProductBySId(this.userId).subscribe(
      (response) => {
        if (response.products && response.products.data) {
          const products = response.products.data;
          this.soldProducts = products.filter((product: any) => product.isSold && product.sellerId === this.userId);
          this.pendingProducts = products.filter((product: any) => !product.isSold && product.sellerId === this.userId);
        }
      },
      (error) => {
        console.error('Error fetching products:', error);
      }
    );
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  toggleSoldDropdown() {
    this.isSoldDropdownOpen = !this.isSoldDropdownOpen;
  }

  markAsSold(productId: string) {
    if (!this.userId) return;

    this.productService.MarkProductAsSold(productId).subscribe({
      next:(res)=>{
        const productIndex = this.pendingProducts.findIndex(p => p.productId === productId);
        if (productIndex > -1) {
          const product = this.pendingProducts[productIndex];
          product.isSold = true;

          // Move product to soldProducts list
          this.soldProducts.unshift(product);
          this.pendingProducts.splice(productIndex, 1);
        }

      },
      error:(err)=>{

        console.error('Error marking product as sold:', err);

      }
    }
  
    );
  }
}
