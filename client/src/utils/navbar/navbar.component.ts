import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Auth, authState } from '@angular/fire/auth';
import { AuthService } from '../../Services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink,CommonModule,FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  isAuthenticated = false; // Update based on user authentication logic

  searchQuery: string = '';
  dropdownOpen = false;
  constructor(
    private auth: Auth,
    private router:Router,
    private authService:AuthService
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = false;
    authState(this.auth).subscribe(user => {
      this.isAuthenticated = !!user;
    });
  }
  toggleDropdown(event: Event): void {
    event.preventDefault();
    this.dropdownOpen = !this.dropdownOpen;
  }
  logout(): void {
    this.router.navigate(['/login']);
    
    this.authService.logout().subscribe({
      next:(res)=>{
      },
      error(err) {
          console.log(err)
      },
      complete() {
          
      },
    })
  }
  searchProducts(event:Event): void {
    event.preventDefault();
    event.preventDefault();
    const query = this?.searchQuery?.trim();
    console.log(query)
    if (query) {
      this.router.navigate(['/search'], { queryParams: { q: query } });
    }
  }
}
