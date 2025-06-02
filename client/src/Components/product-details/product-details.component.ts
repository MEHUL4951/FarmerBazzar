import { Component, Input, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CropService } from '../../Services/crop.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../Services/auth.service';
import { FormsModule } from '@angular/forms';
import { CropCardComponent } from '../crop-card/crop-card.component';
import { PulseLoaderComponent } from '../../utils/pulse-loader/pulse-loader.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Auth, authState } from '@angular/fire/auth';
import { GoogleMapsModule, MapInfoWindow, MapMarker } from '@angular/google-maps';


@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterLink,CropCardComponent,PulseLoaderComponent,
    GoogleMapsModule
  
  ],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css'
})

export class ProductDetailsComponent {
  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;
  center!: google.maps.LatLngLiteral;
  markerPosition!: google.maps.LatLngLiteral;
  mapOptions: google.maps.MapOptions = {
    mapTypeId: 'roadmap',
    zoomControl: true,
    scrollwheel: true,
    disableDoubleClickZoom: false,
    maxZoom: 18,
    minZoom: 5,
  };
  constructor(private route: ActivatedRoute, private cropService: CropService, private router: Router
    ,    private modalService: NgbModal,
    private authService : AuthService,
    private auth:Auth

  ) {
  }
  @ViewChild('ReviewModel') ReviewModel: any;
  product: any;
  data: any;
  canReview : boolean = false;
  user: any
  @Input() avgReviews: any;
  loading: boolean = false;
  reviews: any;
  canAdd: boolean = true;
  related: any[] = [];
  isAuthenticated = false;
  ratings = [1, 2, 3, 4, 5]; // Rating options
  reviewForm = {
    review: '',
    rating: null as number | null,
  };
  sellerMobile : string = '';
  openReviewModal() {
    if(!this.isAuthenticated) {
      this.router.navigate(['/login']);
      return;
    }
    this.modalService.open(this.ReviewModel, { centered: true });;
  }

  ngOnInit(): void {
     this.authService.getMe().subscribe(user => {
      this.user = user;
      this.isAuthenticated = !!user;
      
      if (user) {
        // Check if product is in purchasedProducts array
        const productId = this.route.snapshot.paramMap.get('id');
        console.log(productId)
        console.log(this.user.purchasedProducts)
        console.log(this.user.uid)
        this.canReview = this.user.purchasedProducts?.includes(productId!) ?? false;
      } else {
        this.canReview = false;
      }
    });

    const id = this.route.snapshot.paramMap.get('id');
    this.fetchProductById(id);
  }
  fetchRelatedProducts(productCategory:string) : void {
    this.cropService.getCropByCategoriy(productCategory).subscribe({
      next: (res) => {
        this.related = res.products.filter((product: any) => product.productId !== this.product.productId);  
      },
      error: (err) => {
        console.error('Error fetching related products:', err);
      },
  });
}

  fetchProductById(id: any): void {
    this.loading = true;
    this.cropService.getCropById(id).subscribe({
      next: (res) => {
        const { product } = res;
        this.product = product?.data;
        this.reviews = this.product?.reviews || [];
        this.sellerMobile = product.data.sellerMobile
        this.fetchRelatedProducts(this.product?.productCategory);
        if (
          this.product?.sellerLatitude &&
          this.product?.sellerLongitude &&
          !isNaN(this.product.sellerLatitude) &&
          !isNaN(this.product.sellerLongitude)
        ) {
          this.center = {
            lat: Number(this.product.sellerLatitude),
            lng: Number(this.product.sellerLongitude),
          };
      
          this.markerPosition = { ...this.center };
        } else {
          console.error('Invalid or missing coordinates:', this.product);
        }
      },
      error: (err) => {
        //  this.toast.danger(err.error.error);
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
  
  submitReview() {
    if (this.reviewForm.review && this.reviewForm.rating) {
      // Call your API to save the review
      this.reviewForm.rating = +this.reviewForm.rating;
      this.cropService.addReview(this.reviewForm,this.product.productId).subscribe({
        next: (res) => {
          this.reviews = res?.data?.reviews || [];
          
        },
        error: (err) => {
          console.error('Error submitting review:', err);
        },
      });
      console.log('Submitting Review:', this.reviewForm);
      this.resetForm();
    }
  }

  resetForm() {
    this.reviewForm = {
      review: '',
      rating: null,
    };
  }

  contactSeller() {

    if(!this.isAuthenticated) {
      this.router.navigate(['/login']);
      return;
    }
    const userAgent = navigator.userAgent || navigator.vendor;

    if (/android|iphone|ipad|iPod/i.test(userAgent)) {
      // For mobile devices
      window.location.href = `tel:${this.sellerMobile}`;
    } else {
      // For desktops/laptops, open WhatsApp web
      const whatsappUrl = `https://web.whatsapp.com/send?phone=${this.sellerMobile}`;
      window.open(whatsappUrl, '_blank');
    }
  }
 
  openInfoWindow(marker: MapMarker,) {
    this.infoWindow.open(marker);
  }

}
