
import { CommonModule } from '@angular/common';
import { Component, ErrorHandler, Injectable, Injector } from '@angular/core';


@Injectable(
  {
    providedIn: "root"
  }
)
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    console.error('Error caught by error boundary:', error);
    // Additional logic for logging errors to a service can be added here
  }
}

@Component({
  selector: 'app-errorboundary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-container *ngIf="!hasError; else errorTemplate">
      <ng-content></ng-content>
    </ng-container>
    <ng-template #errorTemplate>
      <div>Something went wrong. Please try again later.</div>
    </ng-template>
  `
  ,
  styleUrl: './errorboundary.component.css'
})
export class ErrorBoundaryComponent {
  hasError = false;

  constructor(private injector: Injector) {}

  handleError(): void {
    this.hasError = true;
  }
}
