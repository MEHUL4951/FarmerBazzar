
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class EquipmentService {
  private url: string = "https://nominatim.openstreetmap.org/reverse";
  private baseUrl: string = "http://localhost:8080/api/v1/equipment";
  private apiKey = '96b13a5d89a5432db489c4c05c298c98';
  constructor(private http: HttpClient,private authService:AuthService) {
  }



  createOrder(data: any): Observable<any> {
    return this.authService.getAuthToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post(`${this.baseUrl}/payment/create-order`, data, { headers });
      })
    );

  }

  saveBooking(data:any):Observable<any>{
    return this.authService.getAuthToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post(`${this.baseUrl}/api/confirm-booking`, data, { headers });
      })
    );
  }

  verifyPayment(data: any): Observable<any> {

    return this.authService.getAuthToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post(`${this.baseUrl}/payment/verify`, data, { headers });
      })
    );
  }

  // Get the latest Firebase authentication token

  addEquipment(data: any): Observable<any> {
    return this.authService.getAuthToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post(`${this.baseUrl}/Add`, data, { headers });
      })
    );
  }
  // Get village details from coordinates (No authentication required)
  getVillageFromCoordinates(lat: number, lon: number): Observable<any> {
    return this.http.get(`${this.url}?lat=${lat}&lon=${lon}&format=json`);
  }
  // Get user's current geolocation
  getCurrentLocation(): Observable<{ latitude: number; longitude: number }> {
    return new Observable(observer => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            observer.next({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
            observer.complete();
          },
          (error) => {
            observer.error(this.getLocationErrorMessage(error));
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // Ensures fresh & accurate data
        );
      } else {
        observer.error('Geolocation is not supported by this browser.');
      }
    });
  }

  // Get nearby equipment (Requires authentication)
  getNearbyEquipment(lat: number, lon: number, maxKM: number): Observable<any> {
    return this.authService.getAuthToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get(`${this.baseUrl}/filter?lat=${lat}&lon=${lon}&maxKM=${maxKM}`, { headers });
      })
    );
  }

  // Provides human-readable error messages for debugging
  private getLocationErrorMessage(error: GeolocationPositionError): string {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'User denied the request for Geolocation. Please enable location access in browser settings.';
      case error.POSITION_UNAVAILABLE:
        return 'Location information is unavailable. Try again later or check your internet connection.';
      case error.TIMEOUT:
        return 'The request to get user location timed out. Try refreshing the page.';
      default:
        return 'An unknown error occurred while fetching location.';
    }
  }

  getCoordinates(address: string) {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${this.apiKey}`;
  
    return this.http.get<any>(url).pipe(
      map((response) => {
        if (response.results && response.results.length > 0) {
          const { lat, lng } = response.results[0].geometry;
          return { latitude: lat, longitude: lng };
        } else {
          throw new Error('No results found for the given address');
        }
      })
    );
  
  }
}
