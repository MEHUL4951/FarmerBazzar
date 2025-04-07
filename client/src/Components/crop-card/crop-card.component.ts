import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInMonths, differenceInYears } from 'date-fns';
@Component({
  selector: 'app-crop-card',
  standalone: true,
  imports: [CommonModule,FontAwesomeModule],
  templateUrl: './crop-card.component.html',
  styleUrl: './crop-card.component.css'
})
export class CropCardComponent {
  @Input() product: any;
  constructor() {}
   getTimeAgo(timestamp: string): string {
    const inputTime = new Date(timestamp);
    const now = new Date();
  
    const diffInYears = differenceInYears(now, inputTime);
    if (diffInYears >= 1) {
      return diffInYears === 1 ? '1 year ago' : `${diffInYears} years ago`;
    }
  
    const diffInMonths = differenceInMonths(now, inputTime);
    if (diffInMonths >= 1) {
      return diffInMonths === 1 ? '1 month ago' : `${diffInMonths} months ago`;
    }
  
    const diffInDays = differenceInDays(now, inputTime);
    if (diffInDays >= 1) {
      return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
    }
  
    const diffInHours = differenceInHours(now, inputTime);
    if (diffInHours >= 1) {
      return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
    }
  
    const diffInMinutes = differenceInMinutes(now, inputTime);
    if (diffInMinutes >= 1) {
      return diffInMinutes === 1 ? '1 minute ago' : `${diffInMinutes} minutes ago`;
    }
  
    return 'Just now';
  }
}
