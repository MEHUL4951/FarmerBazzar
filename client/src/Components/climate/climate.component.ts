import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';


@Component({
  selector: 'app-climate',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './climate.component.html',
  styleUrl: './climate.component.css'
})
export class ClimateComponent {
  lat: number = 20; // Default Latitude
  lon: number = 78; // Default Longitude
  overlay: string = 'rain'; // Default Weather Layer
  windyUrl: SafeResourceUrl;

  // List of Weather Features
  features = [
    { name: '🌧 Rain', overlay: 'rain' },
    { name: '🌡 Temperature', overlay: 'temp' },
    { name: '🌬 Wind', overlay: 'wind' },
    { name: '☁ Clouds', overlay: 'clouds' },
    { name: '🌊 Waves', overlay: 'waves' },
    { name: '🌀 Pressure', overlay: 'pressure' }
  ];

  constructor(private sanitizer: DomSanitizer) {
    this.windyUrl = this.getSafeUrl(this.overlay);
  }

  getSafeUrl(overlay: string): SafeResourceUrl {
    const url = `https://embed.windy.com/embed2.html?lat=${this.lat}&lon=${this.lon}&zoom=5&level=surface&overlay=${overlay}&menu=&message=&marker=&calendar=&pressure=&type=map&location=coordinates&detail=&detailLat=&detailLon=&metricWind=default&metricTemp=default&radarRange=-1`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  updateMap(newOverlay: string) {
    this.overlay = newOverlay;
    this.windyUrl = this.getSafeUrl(newOverlay);
  }

  
}
