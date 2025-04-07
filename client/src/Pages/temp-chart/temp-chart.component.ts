import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import { catchError, map, Observable } from 'rxjs';
Chart.register(ArcElement, Tooltip, Legend);
@Component({
  selector: 'app-temp-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './temp-chart.component.html',
  styleUrl: './temp-chart.component.css'
})
export class TempChartComponent implements OnInit {
  weatherData: any = null;
  isLoading: boolean = false;
  currentDate: string = '';
  currentWeek: string = '';
  currentMonth: string = '';

  data: any;
  options: any;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchWeatherData();
    this.setDateInfo();
    this.initializeChart();
  }

  fetchWeatherData(): Observable<any> {
    const apiUrl = 'https://api.openweathermap.org/data/2.5/weather?q=Hubli&units=metric&appid=f3635cc9b3ba1b949b15fd11912b1c70';
    return this.http.get(apiUrl).pipe(
      map((response) => {
        return response;
      }),
      catchError((error) => {
        console.error('Error fetching weather data:', error);
        throw error;
      })
    );
  }

  setDateInfo(): void {
    const currentDateObj = new Date();
    this.currentDate = currentDateObj.getDate().toString();
    this.currentWeek = currentDateObj.toLocaleDateString('en-US', { weekday: 'long' });
    this.currentMonth = currentDateObj.toLocaleDateString('en-US', { month: 'long' });
  }

  initializeChart(): void {
    this.data = {
      labels: [],
      datasets: [{
        data: [0, 100],
        backgroundColor: ['#b8e62c', '#132a13'],
        borderColor: ['#b8e62c', '#132a13'],
      }]
    };

    this.options = {
      responsive: true,
      maintainAspectRatio: false,
    };
  }

  updateChartData(): void {
    if (this.weatherData) {
      const temperature = this.weatherData.main.temp;
      this.data.datasets[0].data = [temperature, 100 - temperature];
    }
  }
}

