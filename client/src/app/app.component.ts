import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NgToastModule, ToasterPosition } from 'ng-angular-popup';
import { NavbarComponent } from '../utils/navbar/navbar.component';
import { FooterComponent } from '../utils/footer/footer.component';
import { CarouselComponent } from '../utils/carousel/carousel.component';
import { FirebaseMessagingService } from '../Services/firebase-messaging.service';
import { AuthService } from '../Services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Auth, authState } from '@angular/fire/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgToastModule, NavbarComponent, FooterComponent, CarouselComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {
  title = 'FirmarBarzzar';
  TOP_RIGHT = ToasterPosition.TOP_RIGHT
  showNavbarFooter = true;
  private snackBar = inject(MatSnackBar);

  constructor(private router: Router,
    private fcmService: FirebaseMessagingService,
    private authService: AuthService,
    private auth: Auth // Inject your FCM service here
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const hiddenRoutes = ['/login', '/dashboard', '/signup']; // Add routes where navbar/footer should be hidden
        this.showNavbarFooter = !hiddenRoutes.includes(event.url);
      }
    });
  }

  ngOnInit() {
    
    this.fcmService.listenToMessages((payload) => {
      const title = payload.notification?.title || 'New Notification';
      const body = payload.notification?.body || '';
      this.snackBar.open(`${title}: ${body}`, 'Close', {
        duration: 8000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['fcm-snackbar']
      });

    });
  }



}
