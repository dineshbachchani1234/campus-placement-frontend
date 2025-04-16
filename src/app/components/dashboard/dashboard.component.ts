import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { CareerFair } from '../../models/careerfair.model';
import { Application, ApplicationStatus } from '../../models/application.model';
import { Interview } from '../../models/interview.model';
import { JobType } from '../../models/job-listing.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  careerFairs: CareerFair[] = [];
  applications: Application[] = [];
  interviews: Interview[] = [];

  // Update column definitions to match the data structure
  displayedColumnsApplications: string[] = ['jobTitle', 'companyName', 'jobType', 'salary', 'status', 'applicationDate', 'deadline'];
  displayedColumnsInterviews: string[] = ['jobTitle', 'companyName', 'interviewDate', 'feedback', 'result'];
  displayedColumnsCareerFairs: string[] = ['title', 'date', 'location', 'description'];

  constructor(private apiService: ApiService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadCareerFairs();
    
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        console.log("User authenticated:", user.firstName, user.lastName, "ID:", user.id);
        this.loadStudentApplications(user.id);
        this.loadStudentInterviews(user.id);
      } else {
        console.log("No authenticated user found");
        this.applications = [];
        this.interviews = [];
      }
    });
  }

  private loadCareerFairs(): void {
    this.apiService.getCareerFairs().subscribe({
      next: (data) => {
        console.log("Career fairs loaded successfully:", data);
        this.careerFairs = data;
      },
      error: (err) => {
        console.error('Error loading career fairs:', err);
      }
    });
  }

  private loadStudentApplications(userId: number): void {
    console.log("Loading applications for user ID:", userId);
    this.apiService.getApplicationsByStudent(userId.toString()).subscribe({
      next: (data) => {
        console.log("Applications loaded successfully:", data);
        this.applications = data;
      },
      error: (err) => {
        console.error('Error loading applications:', err);
      }
    });
  }

  private loadStudentInterviews(userId: number): void {
    console.log("Loading interviews for user ID:", userId);
    this.apiService.getInterviewsByStudent(userId.toString()).subscribe({
      next: (data) => {
        console.log("Interviews loaded successfully:", data);
        this.interviews = data;
      },
      error: (err) => {
        console.error('Error loading interviews:', err);
      }
    });
  }

  // Helper methods for formatting display values
  formatStatus(status: string): string {
    if (!status) return 'N/A';
    return status.charAt(0) + status.slice(1).toLowerCase();
  }

  formatJobType(jobType: string): string {
    if (!jobType) return 'N/A';
    
    switch(jobType) {
      case JobType.FULL_TIME:
        return 'Full-time';
      case JobType.PART_TIME:
        return 'Part-time';
      case JobType.INTERNSHIP:
        return 'Internship';
      default:
        return jobType;
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  formatSalary(salary: number): string {
    if (!salary) return 'Not specified';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(salary);
  }
}