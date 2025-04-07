import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import * as L from 'leaflet';
@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
  export class MapComponent implements OnChanges,AfterViewInit {
    @Input() latitude: number = 22.3039; // Default to Gujarat, India
    @Input() longitude: number = 70.8022;
    @Input() popupContent: string = '<b>Drag to select location</b>';
    @Output() locationChanged = new EventEmitter<{ lat: number; lng: number }>();
    @Input() isDraggable: boolean = false; // Controls if the marker is draggable
    customIcon = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // Location Pin Icon
        iconSize: [40, 40],  // Icon size
        iconAnchor: [20, 40], // Positioning
        popupAnchor: [0, -35] // Popup positioning
      });
  
    private map!: L.Map;
    private marker!: L.Marker;
    ngAfterViewInit() {
      this.fetchRoadPolylines();
      this.updatePopup();

    }
    ngOnChanges(changes: SimpleChanges): void {
      this.latitude =  changes['latitude']?.currentValue || 22.3039
      this.longitude  = changes['longitude']?.currentValue || 70.8022
      this.loadMap();
     
    }
  
    loadMap(): void {
      if (this.map) {
        this.map.remove();
      }
  
      this.map = L.map('map').setView([this.latitude, this.longitude], 10);
  
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.map);
  
      this.marker = L.marker([this.latitude, this.longitude], { draggable: this.isDraggable,
        icon: this.customIcon
       } )
       .addTo(this.map)
       .bindPopup(this.popupContent) // Dynamic HTML content
       .openPopup();
  
      // Event Listener for Marker Drag
      if(this.isDraggable){
        this.marker.on('dragend', () => {
          const position = this.marker.getLatLng();
          this.locationChanged.emit({ lat: position.lat, lng: position.lng });
        });
      }
     
    }
    updatePopup() {
      if (this.marker) {
        this.marker.bindPopup(this.popupContent).openPopup();
      }
    }

    private fetchRoadPolylines(): void {
      const overpassQuery = `
        [out:json];
        way["highway"](23.00,72.50,23.05,72.60); // Bounding box (Ahmedabad region)
        out geom;
      `;
  
      const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;
  
      fetch(url)
        .then(response => response.json())
        .then(data => {
          this.processOSMData(data);
        })
        .catch(error => console.error("Error fetching road data:", error));
    }
  
    // ✅ Process OSM Data and Draw Polylines
    private processOSMData(data: any): void {
      data.elements.forEach((element: any) => {
        if (element.type === "way" && element.geometry) {
          const latLngs = element.geometry.map((point: any) => [point.lat, point.lon]);
  
          // Draw polyline on map
          const polyline = L.polyline(latLngs, { color: 'blue' }).addTo(this.map);
  
          // ✅ Extract Graph Data
          // this.extractGraphFromMap(polyline);
        }
      });
  
      // console.log("Road Graph Extracted:", this.roadGraph);
    }
  
  }

