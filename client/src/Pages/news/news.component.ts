import { Component, OnInit } from '@angular/core';

import { PredictService } from '../../Services/predict.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './news.component.html',
  styleUrl: './news.component.css'
})
export class NewsComponent  implements OnInit {
  indianFarmingNews: any[] = [];
  loading: boolean = true;
  cowImage = 'assets/COW.png';
  sceneImage = 'assets/scene1.png';
 
  ngOnInit(): void {
    this.fetchIndianFarmingNews();
  }
  constructor(private predictService: PredictService) { }

  fetchIndianFarmingNews(): void {
    const apiUrl = 'https://newsapi.org/v2/everything?q=farming&apiKey=714ef9b8a6ef47d19b4bda6f4f0d100f';

    this.predictService.getNews().subscribe( {
      next:(res)=>{
        const articles = res.articles;
        console.log(articles)

        // Filter articles with both title and image
        const filteredArticles = articles.filter((article: any) => article.title && article.urlToImage);

        // Take the first 5 filtered articles
        this.indianFarmingNews = filteredArticles.slice(0, 5);
        this.loading = false;

      },
      error:(err)=>{
        console.error('Error fetching Indian farming news:', err);
        this.loading = false;

      },
      complete:()=>{

      }

    })
   
  }

  handleClick(url: string): void {
    window.open(url, '_blank');
  }

}
