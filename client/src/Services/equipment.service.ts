
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class EquipmentService {
  private baseUrl: string = "http://localhost:8080/api/v1/equipment";
  private apiKey = '96b13a5d89a5432db489c4c05c298c98';
  constructor(private http: HttpClient,private authService:AuthService) {
  }

  getAllEquipments ():Observable<any>{
    return this.http.get(`${this.baseUrl}/all`);
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

 

  // Get nearby equipment (Requires authentication)
  getNearbyEquipment(userLocation:any, maxKM: number): Observable<any> {
    return this.authService.getAuthToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get(`${this.baseUrl}/filter?lat=${userLocation.lat}&lon=${userLocation.lng}&maxKM=${maxKM}`, { headers });
      })
    );
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
