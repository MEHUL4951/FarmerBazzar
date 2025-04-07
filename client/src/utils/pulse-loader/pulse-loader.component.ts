import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-pulse-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pulse-loader.component.html',
  styleUrl: './pulse-loader.component.css'
})

export class PulseLoaderComponent {
  @Input() loading: boolean = false;
  @Input() color: string = '#1b591c';
  @Input() size: number = 20;

  get dotStyle() {
    return {
      width: `${this.size}px`,
      height: `${this.size}px`,
      backgroundColor: this.color
    };
  }
}
