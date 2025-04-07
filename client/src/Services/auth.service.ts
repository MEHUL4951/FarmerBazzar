
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { Auth, signInWithPopup, GoogleAuthProvider, signOut, authState } from '@angular/fire/auth';
import { Observable, from, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { signInWithCustomToken } from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private provider = new GoogleAuthProvider();
  private url: string = 'http://localhost:8080/api/v1/auth';
  constructor(private auth: Auth, private http: HttpClient,
  ) {
    this.provider.setCustomParameters({
      prompt: 'select_account', // Forces account selection
    });
  }
  getAuthToken(): Observable<string> {
    return authState(this.auth).pipe(
      switchMap(user => {
        if (user) {
          return from(user.getIdToken());
        } else {
          throw new Error('User not authenticated');
        }
      })
    );
  }
  
  

  Login(user: any): Observable<any> {
    return this.http.post(`${this.url}/login`, user).pipe(
      tap(() => {
        // Force Firebase to reload the current user
        this.auth.currentUser?.reload().then(() => {
          console.log("User reloaded:", this.auth.currentUser);
        });
      })
    );
  }
  

  // Request OTP
  RequestOTP(email: any): Observable<any> {
    return this.http.post(`${this.url}/signup/request-otp`, { email });
  }

  // Signup
  Signup(user: any): Observable<any> {
    return this.http.post(`${this.url}/signup/verify-and-complete`, user);
  }

  

  // Sign in with Google
  async loginWithGoogle(): Promise<any> {
    try {
      const result = await signInWithPopup(this.auth, this.provider);
      return result.user;
    } catch (error) {
      console.error('Error during sign-in:', error);
      throw error;
    }
  }

  // Sign out
  logout(): Observable<any> {

    try {
      const providerId = this.auth?.currentUser?.providerData[0]?.providerId; // Check auth provider
      if (providerId === 'google.com') {
        // If user logged in with Google, call Firebase signOut
        return from(signOut(this.auth)).pipe(
          catchError(error => {
            console.error('Error during Google logout:', error);
            return of(undefined);
          })
        );
      } else {
        // If user logged in with Email/Password, call backend API
        return this.getAuthToken().pipe(
          switchMap(token => {
            const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
            return this.http.get(`${this.url}/logout`,{headers});
          })
        );
        
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
    return of(undefined);
  }

  // Get current user state as an observable
  getUser(): Observable<any> {
    return authState(this.auth);
  }
  getMe(): Observable<any> {
    return this.getAuthToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get(`${this.url}/me`, { headers });
      })
    );
  }

  updateUser(data: any): Observable<any> {
    return this.getAuthToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.put(`${this.url}/update`, data, { headers })
      })
    );
       
  }
  singInWithFirebaseCustomtoken(token:string){
    return signInWithCustomToken(this.auth,token)
  }

}
