import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from '../../Services/auth.service';
import { NgToastService } from 'ng-angular-popup'

@Component({
  selector: 'app-verify-email-popup',
  standalone:true,
  imports:[FormsModule,CommonModule],
  templateUrl: './verify-email-popup.component.html',
  styleUrls: ['./verify-email-popup.component.css']
})
export class VerifyEmailPopupComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { userData: any },
  private router: Router,private authService: AuthService,
  private toast:NgToastService
) {}
  @Output() verificationResult: EventEmitter<boolean> = new EventEmitter<boolean>();
  showModal = false
  otp = '';
  errorMessage = '';
  user: any;
  ngOnInit(): void {
      this.user = this.data.userData
      this.showModal = true
      this.authService.RequestOTP(this.user.email).subscribe({
        next: (res) => {
          this.toast.success(res.message)
        },
        error: (err) => {
          this.showModal = false;
          this.toast.danger(err.error.error || 'Internal Server Erorr..');
  
        },
        complete: () => {
          console.log('RequestOTP observable complete');
        },
      });
      
  }
  resendEmail(){

  }
  closeModal(){
    this.showModal = false
    this.errorMessage = ''
  }
  verifyOtp() {
    this.user.otp = this.otp
    this.authService.Signup(this.user).subscribe({
      next: (res) => {
        this.toast.success('Email verified successfully...')
        this.router.navigate(['/login'])
      },
      error: (err) => {
        this.toast.danger(err.error.error);
      },
      complete: () => {
        console.log('Signup observable complete');
        this.showModal = false;
      },
     
    });
    
  }
}
