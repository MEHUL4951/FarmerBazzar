import { Component } from '@angular/core';

@Component({
  selector: 'app-user-manual',
  standalone: true,
  imports: [],
  templateUrl: './user-manual.component.html',
  styleUrl: './user-manual.component.css'
})
export class UserManualComponent {
  scrollTo(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
