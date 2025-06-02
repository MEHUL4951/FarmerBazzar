import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter,OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../Services/auth.service';
import { NgToastService } from 'ng-angular-popup';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnChanges, OnInit {
  user:any;
  ismanual:boolean = false;
  profileImageUrl:any;
  defaultAvatar:any = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png';
  @Input() activeSection!: string;
  @Output() sectionChange = new EventEmitter<string>();
  constructor(private router: Router,
    private authService:AuthService,
    private toast:NgToastService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activeSection']) {
     this.activeSection =  changes['activeSection'].currentValue
      // You can update the local state or perform other actions here
    }
  }
  ngOnInit(): void {
    if(localStorage.getItem("loginMethod")=="manual"){
        this.ismanual = true;
    }
      this.getUserProfile();
  }


  handleSectionChange(section: string): void {
    this.sectionChange.emit(section);
  }

  logout(): void {
    this.authService.logout().subscribe({
      next:(res)=>{
        this.toast.success(res?.message || 'Logout Successfully..');
        localStorage.clear();
        this.router.navigate(['/login']);
      },
      error:(err)=>{

      }
    })

  }
  getUserProfile():void{
    this.authService.getMe().subscribe({
      next: (res)=> {
          this.user = res;
      },
      error: (err)=>{
          
      },

    })
  }
}

