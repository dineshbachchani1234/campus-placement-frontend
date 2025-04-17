import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    CarouselModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  constructor(private router: Router) {}

  featuredJobs = [
    { id: 1, title: 'Software Intern', company: 'Google' },
    { id: 2, title: 'Data Analyst', company: 'Amazon' },
    { id: 3, title: 'Backend Engineer', company: 'Microsoft' }
  ];

  customOptions = {
    loop: true,
    autoplay: true,
    dots: true,
    nav: false,
    items: 1
  };

  goToDashboard() {
    const token = localStorage.getItem('token'); // or sessionStorage or a custom AuthService
    const role = localStorage.getItem('role'); // example: 'STUDENT', 'RECRUITER', 'ADMIN'

    if (!token) {
      this.router.navigate(['/login']);
    } else {
      if (role === 'STUDENT') {
        this.router.navigateByUrl('/dashboard', { replaceUrl: true })
          .then(() => window.location.replace('/dashboard'))
          .catch(err => console.error('nav error', err));
      } else if (role === 'RECRUITER') {
        this.router.navigateByUrl('/recruiter-dashboard', { replaceUrl: true })
          .then(() => window.location.replace('/recruiter-dashboard'))
          .catch(err => console.error('nav error', err));
      } else if (role === 'ADMIN') {
        this.router.navigateByUrl('/admin-dashboard', { replaceUrl: true })
          .then(() => window.location.replace('/admin-dashboard'))
          .catch(err => console.error('nav error', err));
      } else {
        this.router.navigate(['/login']); // fallback
      }
    }
  }
}
