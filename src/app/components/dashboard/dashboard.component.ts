import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // Declare the properties that your template expects
  careerFairs: any[] = [];
  applications: any[] = [];
  interviews: any[] = [];

  displayedColumnsApplications: string[] = ['jobId', 'status', 'applicationDate'];
  displayedColumnsInterviews: string[] = ['interviewDate', 'feedback', 'result'];
  displayedColumnsCareerFairs: string[] = ['title', 'date', 'location'];

  constructor(private apiService: ApiService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadCareerFairs();
    this.loadStudentApplications();
    this.loadStudentInterviews();
  }

  private loadCareerFairs(): void {
    // Adjust the endpoint as per your backend API
    this.apiService.getCareerFairs().subscribe({
      next: (data) => {
        this.careerFairs = data;
      },
      error: (err) => {
        console.error('Error loading career fairs:', err);
      }
    });
  }

  private loadStudentApplications(): void {
    if (this.authService.currentUser) {
      // Replace the endpoint accordingly
      this.apiService.getApplicationsByStudent(`${this.authService.currentUser.id}`).subscribe({
        next: (data) => {
          this.applications = data;
        },
        error: (err) => {
          console.error('Error loading applications:', err);
        }
      });
    }
  }

  private loadStudentInterviews(): void {
    if (this.authService.currentUser) {
      // Replace the endpoint accordingly
      this.apiService.getInterviewsByStudent(`${this.authService.currentUser.id}`).subscribe({
        next: (data) => {
          this.interviews = data;
        },
        error: (err) => {
          console.error('Error loading interviews:', err);
        }
      });
    }
  }
}
