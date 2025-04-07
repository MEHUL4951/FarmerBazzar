import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {Router } from '@angular/router';



@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.css'
})
export class FiltersComponent {
 minMaxKM: { km_min: number; km_max: number } = {
    km_min: 1,
    km_max: 50,
  };
  cats: { category__id: number; category__title: string }[] = [
    { category__id: 1, category__title: 'Tractors & Power Equipment' },
    { category__id: 2, category__title: 'Tractors & Power Equipment' },
    { category__id: 3, category__title: 'Planting & Seeding Equipment' },
    { category__id: 4, category__title: 'Planting & Seeding Equipment' },
    { category__id: 5, category__title: 'Harvesting Equipment' },
    { category__id: 6, category__title: 'Crop Processing Equipment' },
    { category__id: 7, category__title: 'Storage & Transport Equipment' },

  ];

  @Output() filterChange = new  EventEmitter<any>();
  selectedFilters: { [key: string]: any } = {
    maxKM: 0,
    categories: new Set<number>(),
  };

  constructor(
    private router: Router,
 
  ) {}

  ngOnInit() {
  //   setInterval(() => {
  //     if(this.tokenService.getToken()==null){
  //         this.router.navigate(['/login'])
  //     }
  //  }, 100);
    this.selectedFilters['maxKM'] = this.minMaxKM?.km_max || 0;
  }

  updateKM(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.selectedFilters['maxKM'] = Number(inputElement.value);
    
  }

  toggleSelection(filterType: string, value: number) {
    if (this.selectedFilters[filterType].has(value)) {
      this.selectedFilters[filterType].delete(value);
    } else {
      this.selectedFilters[filterType].add(value);
    }
    this.emitFilterChange();
  }

  emitFilterChange() {
    this.filterChange.emit(this.selectedFilters);
  }
}