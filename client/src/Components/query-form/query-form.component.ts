import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { PredictService } from '../../Services/predict.service';
import { NgToastService } from 'ng-angular-popup';
import { Auth} from '@angular/fire/auth';
import { AuthService } from '../../Services/auth.service';


@Component({
  selector: 'app-query-form',
  standalone: true,
  imports: [FormsModule, MarkdownModule,CommonModule],
  templateUrl: './query-form.component.html',
  styleUrl: './query-form.component.css'
})
export class QueryFormComponent {
  userQuery: string = '';
  aiResponse: string = '';
  chatHistory: { query: string; response: string }[] = [];
  isLoading: boolean = false;
  user : any = null
  userId: any = ''
  
  constructor(
    private predictService:PredictService , 
    private router: Router,
    private toast:NgToastService,
    private auth: Auth,
    private authService : AuthService
  ) {}

  ngOnInit(): void {
    this.userId = this.auth.currentUser?.uid;
    if (this.userId === undefined) {
      this.authService.getMe().subscribe(
        (user) => {
          this.user = user;
          if (!this.userId) {
            this.userId = this.user?.uid;
          }
  
          // console.log("User ID from getMe():", this.userId);
  
          if (!this.userId) {
            this.toast.danger('User ID not found. Please log in again.');
            return;
          }
  
          // Load chat history after getting the user ID
          this.loadChatHistory();
        },
        (error) => {
          console.error('Error fetching user:', error);
          this.toast.danger('Failed to fetch user. Please log in again.');
        }
      );
    } else {
      console.log("User ID from auth:", this.userId);
      this.loadChatHistory();
    }
  }
  
  loadChatHistory(): void {
    const savedHistory = localStorage.getItem(`chatHistory_${this.userId}`);
    if (savedHistory) {
      this.chatHistory = JSON.parse(savedHistory);
    }
  }
  
  onSubmit() {

    const formattedQuery = `
    Please provide a structured response in the following format:
    - Use **bold headings** for main points and format them in a **numbered list** (1, 2, 3...).
    - Subpoints should be inside main points as bullet points.
    - Ensure **two line breaks** between different main points for clarity.
    - Ensure **proper formatting** for readability.

    User Query: ${this.userQuery}
  `;
    if (this.userQuery.trim()) {
      this.isLoading = true;

      this.predictService.getAiResponse(formattedQuery).subscribe(
        (response) => {
          this.aiResponse = this.formatResponse(response.response);
          this.saveToHistory(this.userQuery, this.aiResponse);
          this.userQuery = '';
          this.isLoading = false;
        },
        (error) => {
          console.error('Error fetching AI response', error);
          this.toast.danger("you are not Logged in ! Please Refresh the Page")
          this.isLoading = false;
        }
      );
    }
  }

  formatResponse(response: string): string {
    return response
      .replace(/\*\*(.*?)\*\*/g, '<h2 class="text-xl font-bold my-2">$1</h2>') // Convert bold headers
      .replace(/^- (.*)/gm, '<p class="ml-4">\*$1</p>') // Convert bullet points
      .replace(/\*/g, '') // Removes any remaining '*' characters
      .replace(/\n\n/g, '<br>'); // Space between sections
  }
  
  saveToHistory(query: string, response: string) {
   
    if (!this.userId) {
      this.toast.danger('User ID not found. Please log in again.');
      return;
    }

    //Retrive the existing chat history for the user
    const userChatHistory  = JSON.parse(localStorage.getItem(`chatHistory_${this.userId}`) || '[]')
    userChatHistory.push({query,response})

  // Save updated chat history in localStorage
   localStorage.setItem(`chatHistory_${this.userId}`, JSON.stringify(userChatHistory));  }

  clearHistory() {

    if (!this.userId) {
      this.toast.danger('User ID not found. Please log in again.');
      return;
    }
    this.chatHistory = [];
    localStorage.removeItem(`chatHistory_${this.userId}`);
  }
}
