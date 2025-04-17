import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service'; // Import AuthService
import { Router } from '@angular/router'; // Import Router
import { CommonModule } from '@angular/common'; // Import CommonModule for *ngIf
import { RouterModule } from '@angular/router'; // Import RouterModule for routerLink
import {MatMenuModule} from '@angular/material/menu';



@Component({
  selector: 'app-header',
  standalone: true, // Make it standalone
  imports: [CommonModule, RouterModule,MatMenuModule], // Import necessary modules
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'] // Corrected styleUrl to styleUrls
})
export class HeaderComponent {

  constructor(
    private authService: AuthService, // Inject AuthService
    private router: Router // Inject Router
  ) {}

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  get userName(): string {
    const user = this.authService.currentUser;
    if (!user) return '';
    
    // Return the full email
    return user.role;
    
  }

  logout(): void {
    this.authService.logout();
    // Navigation is handled within authService.logout()
  }
}