import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, switchMap } from 'rxjs';

import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PredictService {
  constructor(private http:HttpClient,
    private authService:AuthService
  ) { 
  
  }
  url:string = 'http://localhost:8080/api/v1/predict'
  // url:string = 'http://127.0.0.1:5000'
  apiUrl:string = 'https://newsapi.org/v2/everything?q=farming&apiKey=714ef9b8a6ef47d19b4bda6f4f0d100f';
 
  
  CropPredict(data:any):Observable<any>{
    return this.authService.getAuthToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post(`${this.url}/recommend`,data,{headers})
      })
    );
    
  }
  FertilizerPredict(data:any):Observable<any>{
    return this.authService.getAuthToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post(`${this.url}/predict-fertilizer`,data ,{headers})
      })
    );
    
   
  }
  getNews():Observable<any>{
    return this.http.get(this.apiUrl)
  }
  getAiResponse(userQuery: string): Observable<any> {
    return this.authService.getAuthToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post<any>(`${this.url}/query`, {userQuery},{headers});
      })
    );
    
    
  }

  predictCropDisease(data:any):Observable<any>{
    return this.http.post(`${this.url}/predict-crop-disease`,data)
  }
}


