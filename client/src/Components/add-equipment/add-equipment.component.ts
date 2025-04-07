import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { EquipmentService } from '../../Services/equipment.service';
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'app-add-equipment',
  standalone: true,
  imports: [FormsModule,ReactiveFormsModule],
  templateUrl: './add-equipment.component.html',
  styleUrl: './add-equipment.component.css'
})
export class AddEquipmentComponent implements OnInit {
  equipmentForm!:FormGroup;
  address:any;
  marker: any;
  latitude:any;
  longitude:any;
  coordinates: { latitude: number; longitude: number } | null = null;

  constructor(private equipmentService: EquipmentService,private fb:FormBuilder,
    private http:HttpClient
  ) {
    this.equipmentForm = this.fb.group({
      name : ['',Validators.required],
      address:['',Validators.required],
      price_per_day : [null,Validators.required],
      type:['',Validators.required],
      latitude: [22.4707019,Validators.required],
      longitude: [70.05773,Validators.required],
    })
   }
   saveEquipment(): void {
    if (!this.equipmentForm.valid) return;
  
    this.convertAddressToCoordinates().subscribe({
      next: () => {
        const data = this.equipmentForm.value;
        this.equipmentService.addEquipment(data).subscribe({
          next: (res) => console.log('Equipment added:', res),
          error: (err) => console.error('Add failed:', err),
        });
      },
      error: (err) => {
        console.error('Geocoding failed:', err);
        alert('Could not fetch coordinates.');
      }
    });
  }
  convertAddressToCoordinates(): Observable<void> {
    const address = this.equipmentForm.get('address')?.value;
    return this.equipmentService.getCoordinates(address).pipe(
      map((coords) => {
        this.equipmentForm.patchValue({
          latitude: coords.latitude,
          longitude: coords.longitude
        });
      })
    );
  }
  

  ngOnInit(): void {
    this.getUserLocation();
  }
  
  getUserLocation(): void {
  //   this.equipmentService.getCurrentLocation().subscribe({
  //     next: (position: any) => {
  //       this.equipment.latitude = position.latitude;
  //       this.equipment.longitude = position.longitude;
  //       //  this.getAddressFromCoordinates();

  //       // Set map view to user's location
  //       this.map.setView([position.latitude, position.longitude], 15);
  //       this.marker.setLatLng([position.latitude, position.longitude]);
  //       // Add a marker for the user
  //       L.marker([this.equipment.latitude, this.equipment.longitude], {
  //         icon: L.icon({
  //           iconUrl: 'https://static.vecteezy.com/system/resources/previews/021/495/912/non_2x/google-map-symbol-logo-red-design-illustration-free-vector.jpg',
  //           iconSize: [30, 50]
  //         })
  //       })
  //         .addTo(this.map)
  //         .bindPopup('You are here!')
  //         .openPopup()
  //     },
  //     error: (error) => console.error('Error getting location:', error)
  //   });
  // }
  }
}
