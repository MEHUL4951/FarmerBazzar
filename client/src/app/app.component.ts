import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import {NgToastModule , ToasterPosition} from 'ng-angular-popup';
import { NavbarComponent } from '../utils/navbar/navbar.component';
import { FooterComponent } from '../utils/footer/footer.component';
import { CarouselComponent } from '../utils/carousel/carousel.component';

//  ToasterPosition {
//   TOP_LEFT = 'toaster-top-left',
//   TOP_CENTER = 'toaster-top-center',
//   TOP_RIGHT = 'toaster-top-right',
//   BOTTOM_LEFT = 'toaster-bottom-left',
//   BOTTOM_CENTER = 'toaster-bottom-center',
//   BOTTOM_RIGHT = 'toaster-bottom-right'
// }
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,NgToastModule,NavbarComponent,FooterComponent,CarouselComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {
  title = 'FirmarBarzzar';
  TOP_RIGHT = ToasterPosition.TOP_RIGHT
  showNavbarFooter = true;

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const hiddenRoutes = ['/login', '/dashboard','/signup']; // Add routes where navbar/footer should be hidden
        this.showNavbarFooter = !hiddenRoutes.includes(event.url);
      }
    });
  }
   
}
