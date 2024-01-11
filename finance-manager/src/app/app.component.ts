import { Component, OnInit, Renderer2  } from '@angular/core';
import { AuthService } from './services/auth.service';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { User } from 'firebase/auth'; // Add this import
import { Router } from '@angular/router'; // Add this import

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  credentials: FormGroup;
  userEmail: string = 'Guest';

  constructor(private authService: AuthService, private fb: FormBuilder, private router: Router, private renderer: Renderer2) {
    this.credentials = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }
  

  ngOnInit(): void {
    // Subscribe to the currentUser$ observable to get real-time updates
    this.authService.currentUser$.subscribe((user: User | null) => {
      this.userEmail = this.authService.getCurrentUserEmail() || 'Guest';
      console.log(this.userEmail);
    });
  }

 

  public appPages = [
    { title: 'Budgets', url: '/home', icon: 'home' }, // Add this line
    { title: 'Insights', url: '/insight', icon: 'pie-chart' },
    // { title: 'Outbox', url: '/folder/outbox', icon: 'paper-plane' },
    // { title: 'Favorites', url: '/folder/favorites', icon: 'heart' },
    // { title: 'Archived', url: '/folder/archived', icon: 'archive' },
    // { title: 'Trash', url: '/folder/trash', icon: 'trash' },
    // { title: 'Spam', url: '/folder/spam', icon: 'warning' }
    
  ];
 //public labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];
  
}
