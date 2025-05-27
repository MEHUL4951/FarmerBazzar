
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Auth} from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
@Injectable({
  providedIn: 'root'
})
export class CropService {
  private url: string = 'http://localhost:8080/api/v1/crop';


  constructor(private http: HttpClient, private auth: Auth,
    private authService: AuthService,
  ) {
     
  }

  // Function to get the latest Firebase Token
  
  

  // Get All Crops
  getAllCrops(): Observable<any> {
        return this.http.get(`${this.url}/GetAllProducts`);

  }

  // Get Crop By ID
  getCropById(CropId: any): Observable<any> {
    return this.http.get(`${this.url}/GetProductById/${CropId}`);
  }

  // Add Crop
  AddCrop(data: any): Observable<any> {
    return this.authService.getAuthToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post(`${this.url}/Add`, data, { headers });
      })
    );
  

  }

  // Get Crop By Category
  getCropByCategoriy(category: any): Observable<any> {
    return this.http.get(`${this.url}/ProductCategory/${category}`);
  }

  // Get Crop By Name
  getCropByName(name: string): Observable<any> {
    return this.http.get(`${this.url}/ProductName/${name}`);
  }
  
  // Add Review
  addReview(data: any, productId: string): Observable<any> {
    return this.authService.getAuthToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post(`${this.url}/AddReview/${productId}`, data, { headers })
      })
    );
  }

  // Get Reviews
  getReviews(productId: string): Observable<any> {
    return this.http.get(`${this.url}/GetReviews/${productId}`);
  }

  GetProductBySId(SellerId: any): Observable<any> {
    return this.http.get(`${this.url}/GetProductBySellerId/${SellerId}`);
  }
  GetUserByUid(uid: any): Observable<any> {
    return this.http.get(`${this.url}/GetUser/${uid}`)
  }
  MarkProductAsSold(productId: string): Observable<any> {
    return this.authService.getAuthToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.delete(`${this.url}/delete/${productId}`, { headers })
      })
    );
  }

  SendVerificationEmail(data: {
  productId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  sellingPrice: string;
  sellingDate: string;
  quantitySold: string;
}) {
  const body = {
    productId: data.productId,
    buyerName: data.buyerName,
    buyerEmail: data.buyerEmail,
    buyerPhone: data.buyerPhone,
    sellingPrice: data.sellingPrice,
    sellingDate: data.sellingDate,
    quantitySold: data.quantitySold
  };

  // Get the authentication token
  return this.authService.getAuthToken().pipe(
    switchMap((token: string) => {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      
      // Sending the POST request with the Authorization header
      return this.http.post<any>(`${this.url}/VerifyPurchase`, body, { headers });
    })
  );
}


}
