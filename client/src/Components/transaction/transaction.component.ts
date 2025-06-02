

import { Component } from '@angular/core';
import { Auth, onAuthStateChanged, user } from '@angular/fire/auth';
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
  partialSoldProducts: any[] = [];
  boughtProducts: any[] = [];
  userId: string | null = null;
  isDropdownOpen = false;
  isSoldDropdownOpen = false;
  isPartialDropdownOpen = false;
  isBoughtDropdownOpen = false;
  showFormForProductId: string | null = null;

  soldForm = {
    productId: '',
    buyerName: '',
    buyerEmail: '',
    buyerPhone: '',
    sellingPrice: '',
    sellingDate: '',
    quantitySold: ''
  };


  constructor(
    private productService: CropService,
    private auth: Auth,
    private toast: NgToastService
  ) { }

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
    // Fetching seller products
    this.productService.getAllCrops().subscribe(
      (response) => {

        if (response.products) {
          const products = response.products
          console.log(products)
          this.soldProducts = products.filter((product: any) => product.isSold && product.sellerId === this.userId);
          this.partialSoldProducts = products.filter((product: any) => !product.isSold && product.soldQuantity > 0 && product.sellerId === this.userId);
          this.pendingProducts = products.filter((product: any) => !product.isSold && product.soldQuantity == 0 && product.sellerId === this.userId);
          this.boughtProducts = products.filter((product: any) =>  product.buyerIds && product.buyerIds.includes(this.userId) );
          console.log((this.soldProducts))
          console.log((this.partialSoldProducts))
          console.log((this.pendingProducts))
          console.log((this.boughtProducts))
        }

      },
      (error) => {
        console.error('Error fetching products:', error);
      }
    );

  }

  openSoldForm(productId: string) {
    this.showFormForProductId = productId;
    this.soldForm.productId = productId;
  }

  closeSoldForm() {
    this.showFormForProductId = null;
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  toggleSoldDropdown() {
    this.isSoldDropdownOpen = !this.isSoldDropdownOpen;
  }
  togglePartialDropdown() {
    this.isPartialDropdownOpen = !this.isPartialDropdownOpen;
  }
  toggleBoughtDropdown(){
    this.isBoughtDropdownOpen = !this.isBoughtDropdownOpen;
  }
  markAsSold(productId: string) {
    if (!this.userId) return;

    this.productService.MarkProductAsSold(productId).subscribe({
      next: (res) => {
        const productIndex = this.pendingProducts.findIndex(p => p.productId === productId);
        if (productIndex > -1) {
          const product = this.pendingProducts[productIndex];
          product.isSold = true;

          // Move product to soldProducts list
          this.soldProducts.unshift(product);
          this.pendingProducts.splice(productIndex, 1);
        }

      },
      error: (err) => {
        console.error('Error marking product as sold:', err);

      }
    });
  }

  submitSoldForm() {
    this.productService.SendVerificationEmail(this.soldForm).subscribe({
      next: () => {
        this.toast.success("Verification email sent to buyer");
      
        this.showFormForProductId = null;
        this.soldForm = {
          productId: '',
          buyerName: '',
          buyerEmail: '',
          buyerPhone: '',
          sellingPrice: '',
          sellingDate: '',
          quantitySold: ''
        };
      },
      error: (err: any) => {
        console.error("Failed to send email:", err);
        this.toast.danger("Email sending failed");
      }
    });
  }

}
