import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import * as L from 'leaflet';
import { EquipmentService } from '../../Services/equipment.service';
import { FiltersComponent } from '../filters/filters.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { GoogleMapsModule, MapInfoWindow, MapMarker } from '@angular/google-maps';
declare var Razorpay: any;
@Component({
  selector: 'app-nearby-equipment',
  standalone: true,
  imports: [FiltersComponent, CommonModule, FormsModule,
    GoogleMapsModule
  ],
  templateUrl: './nearby-equipment.component.html',
  styleUrl: './nearby-equipment.component.css'
})

export class NearbyEquipmentComponent implements OnInit {
  @ViewChild('bookingModal') bookingModal: any;
  userLatitude: number = 22.22;
  userLongitude: number = 70.23
  center: google.maps.LatLngLiteral = { lat:22.462464 , lng: 70.0514304 }; // Example: Gir Somnath
  zoom = 12;
  equipments: any = [];
  selectedEquipment: any = null;
  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;
  booking = {
    equipmentId: '',
    date: '',
    duration: 1
  };
  filters: any
  

  constructor(
    // private geolocationService: GeolocationService,
    private equipmentService: EquipmentService,
    private modalService: NgbModal,

  ) { }

  ngOnInit(): void {
    this.getCurrentLocation();
   
  }

  private getCurrentLocation(): Promise<google.maps.LatLngLiteral> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
            console.log(position.coords.latitude, position.coords.longitude);
          },
          (error) => reject(error),
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      } else {
        reject('Geolocation not supported.');
      }
    });
  }


  openInfoWindow(marker: MapMarker, equipment?: any): void {
    this.selectedEquipment = equipment;
    this.infoWindow.open(marker);
  }
   

  private loadNearbyEquipment(): void {
    this.equipmentService.getNearbyEquipment(this.userLatitude, this.userLongitude, this.filters?.maxKM).subscribe({
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
      amount: this.selectedEquipment.price_per_day,
      currency: 'INR',
    }

    this.equipmentService.createOrder(data).subscribe({
      next: (res) => {
        console.log(res);
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
      duration: this.booking.duration
    };
    this.equipmentService.saveBooking(booking).subscribe({
      next: (response) => {
        this.loadNearbyEquipment();
        console.log('Booking saved:', response);
      },
      error: (error) => {
        console.error('Error saving booking:', error);
      }
    });
  
 
  }

}