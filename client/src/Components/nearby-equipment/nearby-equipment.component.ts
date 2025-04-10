import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';

import { EquipmentService } from '../../Services/equipment.service';
import { FiltersComponent } from '../filters/filters.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { GoogleMapsModule, MapInfoWindow, MapMarker } from '@angular/google-maps';

import { darkMapStyle } from '../../utils/mapstyle';
declare var Razorpay: any;
@Component({
  selector: 'app-nearby-equipment',
  standalone: true,
  imports: [FiltersComponent, CommonModule, FormsModule,
    GoogleMapsModule,
   
  ],
  templateUrl: './nearby-equipment.component.html',
  styleUrl: './nearby-equipment.component.css'
})

export class NearbyEquipmentComponent implements OnInit {
  @ViewChild('bookingModal') bookingModal: any;
  @ViewChild(MapInfoWindow) userInfoWindow!: MapInfoWindow; 


  userLocationIcon: google.maps.Icon = {
    url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
    scaledSize: new google.maps.Size(40, 40)
  };


  openUserInfoWindow(marker: MapMarker) {
    if (this.userInfoWindow) {
      this.userInfoWindow.open(marker);
    } else {
      console.warn('userInfoWindow not available yet');
    }
  }
  

  center: google.maps.LatLngLiteral = { lat: 22.462464, lng: 70.0514304 }; // Example: Gir Somnath
  userLocation: google.maps.LatLngLiteral | null = null;


  options: google.maps.MapOptions = {
    styles: darkMapStyle,
    disableDefaultUI: false,
    zoomControl: true
  };
  zoom = 12;
  equipments: any = [];
  selectedEquipment: any = null;
  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;
  duration:any
  filters: any


  constructor(
    // private geolocationService: GeolocationService,
    private equipmentService: EquipmentService,
    private modalService: NgbModal,

  ) { }

  ngOnInit(): void {
    this.getCurrentLocation();
    this.getAllEquipments();

  }
  getAllEquipments(): void {

    this.equipmentService.getAllEquipments().subscribe({

      next: (res) => {
        this.equipments = res?.data || []

      },
      error: (err) => {

      },
      complete: () => {

      }
    })

  }

  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        this.userLocation = coords;
        this.center = coords; // center the map to user location
        this.zoom = 14; // optionally zoom in
      }, (error) => {
        console.error("Geolocation error:", error);
      });
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }


  openInfoWindow(marker: MapMarker, equipment?: any): void {
    this.selectedEquipment = equipment;
    this.infoWindow.open(marker);
  }


  private loadNearbyEquipment(): void {
    this.equipmentService.getNearbyEquipment(this.userLocation, this.filters?.maxKM).subscribe({
      next: (response) => {
        this.equipments = response?.data || [];
      },
      error: (error) => console.error('Error getting nearby equipment:', error)
    });
  }

  applyFilters(filters: any) {
    this.filters = filters;
    this.loadNearbyEquipment();
    // Apply API filtering logic here
  }
  bookEquipment(content: any) {
    this.modalService.open(this.bookingModal, { centered: true });;
  }
  confirmBooking() {
    const data = {
      amount: this.selectedEquipment.price_per_day * this.duration,
      currency: 'INR',
    }

    this.equipmentService.createOrder(data).subscribe({
      next: (res) => {
        const order = res;
        const options = {
          key: 'rzp_test_b4fI7CTGW150PQ',
          amount: order.amount,
          currency: order.currency,
          name: 'Farmer Bazaar',
          description: `Booking: ${this.selectedEquipment.name}`,
          order_id: order.id,
          handler: (response: any) => {
            this.verifyPayment(response);
            // this.saveBooking()
          },
          prefill: {
            name: 'Shivam',
            email: 'Shimam@gamil.com',
            contact: '9999999999',
          },
          theme: {
            color: '#1e88e5',
          },
        };
        const rzp = new Razorpay(options);
        rzp.open();
      },
      error: (err) => {

      }

    })
  }

  verifyPayment(response: any) {
    this.equipmentService.verifyPayment(response).subscribe({
      next: (res) => {
        this.saveBooking();
      },
      error: (err) => {
        console.error('Error verifying payment:', err);
      }
    });
  }

  saveBooking() {
    const booking = {
      equipmentId: this.selectedEquipment.id,
      date: new Date(),
      duration: this.duration,
      status: 'active'
    };
    this.equipmentService.saveBooking(booking).subscribe({
      next: (response) => {
        this.getAllEquipments();
        // console.log('Booking saved:', response);
      },
      error: (error) => {
        // console.error('Error saving booking:', error);
      }
    });


  }

}