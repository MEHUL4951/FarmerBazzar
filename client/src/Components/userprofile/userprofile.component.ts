import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from 'firebase/auth';
import { AuthService } from '../../Services/auth.service';
import { CommonModule } from '@angular/common';
import { NgToastService } from 'ng-angular-popup';

@Component({
  selector: 'app-userprofile',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './userprofile.component.html',
  styleUrl: './userprofile.component.css'
})
export class UserprofileComponent implements OnInit {
  profileImageUrl:any;
  @ViewChild('fileInput') fileInput!: ElementRef;
  states = ['Gujarat', 'Maharashtra', 'Rajasthan', 'Delhi', 'Karnataka'];
  user: any;
  profileForm!: FormGroup;
  defaultAvatar: string = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTu4UrNSHve757RvQypVlE6tqBxN0L9vmYQ5A&s'; // Default profile pic

  constructor(private auth: Auth, private fb: FormBuilder,
    private authService: AuthService,
    private toast:NgToastService

  ) { }

  ngOnInit() {
    this.getUserProfile();
    this.profileForm = this.fb.group({
      firstName: [this.user?.firstName || '', [Validators.required, Validators.minLength(3)]],
      lastName: [this.user?.lastName || '', [Validators.required, Validators.minLength(3)]],
      phoneNumber: [
        this.user?.phoneNumber || '', 
        [Validators.required, Validators.pattern(/^\d{10}$/)] // Validates Indian phone numbers
      ],
      state: [this.user?.state || '', [Validators.required]]
    });


  }

   updateProfile() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched(); // Show errors if form is invalid
      return;
    }
    let data = {
      ...this.profileForm.value,
      profileImage:this.profileImageUrl
    }
    this.authService.updateUser(this.profileForm.value).subscribe({
        next:(res)=>{
          this.toast.success(res.message);
        },
        error(err) {
        },
        complete() {
            
        },
    });


   
  }
  getUserProfile(): void {
    this.authService.getMe().subscribe({
      next: (res) => {
        this.user = res;
        this.profileForm.patchValue({
          firstName: this.user?.firstName,
          lastName: this.user?.lastName,
          phoneNumber: this.user?.phoneNumber,
          state: this.user?.state
        })


      },
      error: (err) => {
        console.log(err)
      },
      complete() {

      },
    })
  }
  triggerFileInput():void{
    this.fileInput.nativeElement.click();
  }
  onFileSelected(event: any) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.profileImageUrl = reader.result as string; // Set the image preview URL
      };
      reader.readAsDataURL(file); // Convert file to base64
    }
    
  }
}
