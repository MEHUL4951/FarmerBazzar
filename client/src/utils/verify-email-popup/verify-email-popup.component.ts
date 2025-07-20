import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Inject, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from '../../Services/auth.service';
import { NgToastService } from 'ng-angular-popup'
import { Subject } from 'rxjs';

@Component({
  selector: 'app-verify-email-popup',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './verify-email-popup.component.html',
  styleUrls: ['./verify-email-popup.component.css']
})
export class VerifyEmailPopupComponent implements OnInit, OnDestroy{
 private destroy$ = new Subject<void>();
   
  constructor(@Inject(MAT_DIALOG_DATA) public data: { userData: any },
    private router: Router, private authService: AuthService,
    private toast: NgToastService
  ) { }
  @Output() verificationResult: EventEmitter<boolean> = new EventEmitter<boolean>();
  showModal = false
  otp = '';
  errorMessage = '';
  user: any;

  resendDisabled: boolean = true;
  resendTimer: number = 60;
  timerInterval: any;

  ngOnInit(): void {
    this.user = this.data.userData
    this.showModal = true
    this.startResendTimer();
    this.authService.RequestOTP(this.user.email).subscribe({
      next: (res) => {
        this.toast.success(res.message)
      },
      error: (err) => {
        this.showModal = false;
        this.toast.danger(err.error.error || 'Internal Server Erorr..');
        this.resendDisabled = false;


      },
      complete: () => {
        console.log('RequestOTP observable complete');
      },
    });

  }

  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  startResendTimer(): void {
    this.resendDisabled = true;
    this.resendTimer = 60;

    this.timerInterval = setInterval(() => {
      this.resendTimer--;
      if (this.resendTimer <= 0) {
        this.resendDisabled = false;
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }
  resendOtp() {
    this.authService.RequestOTP(this.user.email).subscribe({
      next: (res) => {
        this.toast.success(res.message)
      },
      error: (err) => {
        this.showModal = false;
        this.toast.danger(err.error.error || 'Internal Server Erorr..');
        this.resendDisabled = false;

      },
      complete: () => {
        this.startResendTimer();
        console.log('RequestOTP observable complete');
      },
    });
  }

  closeModal() {
    this.showModal = false
    this.errorMessage = ''
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
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
