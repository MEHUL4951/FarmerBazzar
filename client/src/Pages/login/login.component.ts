import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup,ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PulseLoaderComponent } from '../../utils/pulse-loader/pulse-loader.component';
import { AuthService } from '../../Services/auth.service';
import { NgToastService } from 'ng-angular-popup';
import { Auth } from '@angular/fire/auth';
import { FirebaseMessagingService } from '../../Services/firebase-messaging.service';

@Component({
  selector: 'app-login',
  standalone:true,
  imports:[ReactiveFormsModule,CommonModule,RouterLink,PulseLoaderComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading: boolean = false;
  showPassword: boolean = false;
  emailError: string = '';
  passwordError: string = '';
  constructor(
    private fb: FormBuilder,
    private router: Router,
   private authService: AuthService,

   private toast:NgToastService,
   private auth:Auth,
   private fcmService:FirebaseMessagingService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, this.passwordValidator]],
    });
  }

  ngOnInit(): void {}

  passwordValidator(control: any) {
    const value = control.value;
    const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[$@$!%*?&#])[A-Za-z\d$@$!%*?&#]{2,}$/;
    return regex.test(value) ? null : { invalidPassword: true };
  }

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

  async handleLogin(): Promise<void> {
    if (this.loginForm.valid) {
      const userData = this.loginForm.value;
      this.loading = true;
      this.authService.Login(userData).subscribe({
        next: async (res) => {
          const {token} = res
          const userCred = await this.authService.singInWithFirebaseCustomtoken(token)
          this.toast.success('Login successful');
          this.fcmService.requestPermissionAndToken().then(fcmtoken => {
            if (fcmtoken) {
              // console.log('✅ FCM Token:', token);
              this.authService.savefcmToken(fcmtoken).subscribe({
                next: (response) => {
                  console.log('Token saved successfully:', response);
                },
                error: (error) => {
                  console.error('Error saving token:', error);
                }
              })
            }
          });
          this.router.navigate(['/'])
          this.loading = false;
        },
        error: (err) => {
           this.toast.danger(err.error.error || 'Internal Server Error..');
           this.loading = false;
        },
      
      })
    }else{
      return;
    }

  }

  async handleGoogleSignIn(): Promise<void> {
    try{
      var user = await this.authService.loginWithGoogle();
      // console.log(user)
      // const user1 = this.auth.currentUser?.providerData
   
      const idToken = await user.getIdToken();
   
      this.authService.verifyFirebaseUser(idToken).subscribe({
        next: (res) => {
          // Save session/token returned by your backend if needed
          console.log('User authenticated and saved in backend:', res);
          this.fcmService.requestPermissionAndToken().then(token => {
            if (token) {
              // console.log('✅ FCM Token:', token);
              this.authService.savefcmToken(token).subscribe({
                next: (response) => {
                  // console.log('Token saved successfully:', response);
                },
                error: (error) => {
                  console.error('Error saving token:', error);
                }
              })
            }
          });









          // ✅ Now save FCM token
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error('Error verifying Firebase user on backend:', err);
        }
      })
      await this.router.navigate(['/']);
    }catch(err:any){
      console.log(err);
       // Handle specific errors with user-friendly messages
       if (err.code === 'auth/popup-closed-by-user') {
        console.warn('Sign-In was canceled by the user.');
      } else if (err.code === 'auth/network-request-failed') {
        alert('Network error. Please check your connection and try again.');
      } else {
        console.error('Unhandled error during sign-in:', err);
      }
    }
  }
}