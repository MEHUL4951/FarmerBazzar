import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CropService } from '../../Services/crop.service';
import { CropCardComponent } from '../crop-card/crop-card.component';
import { PulseLoaderComponent } from '../../utils/pulse-loader/pulse-loader.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CropCardComponent,RouterLink,PulseLoaderComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent {
  query: string = '';
  products: any[] = [];
  loading: boolean = false;
  constructor(private route: ActivatedRoute,private cropService:CropService) {}
  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.query = params['q'] || '';
      this.searchProducts();
    });
  }
   searchProducts() {
    this.loading = true;
      this.cropService.getCropByName(this.query).subscribe({
        next:(data) =>
        {
          this.products = data?.products || [];
          this.loading = false;
        },
        error:(error) =>
        {
          console.log(error);
          this.loading = false
        },
        complete:() =>
        {
          this.loading = false
        }
       
      });
   }

}
