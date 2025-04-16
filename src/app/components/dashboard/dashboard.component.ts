import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { CareerFair } from '../../models/careerfair.model';
import { Application, ApplicationStatus, JobListing } from '../../models/application.model';
import { Interview, InterviewStatus, InterviewResult } from '../../models/interview.model';
import { JobType } from '../../models/job-listing.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatChipsModule, MatBadgeModule, MatButtonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  careerFairs: CareerFair[] = [];
  applications: Application[] = [];
  interviews: Interview[] = [];
  upcomingInterviews: Interview[] = [];

  jobs: JobListing[] = [];
  displayedColumnsJobs: string[] = ['title', 'jobType', 'salary', 'action'];

  // Update column definitions to match the data structure
  displayedColumnsApplications: string[] = ['jobTitle', 'companyName', 'jobType', 'salary', 'status', 'applicationDate', 'deadline'];
  displayedColumnsInterviews: string[] = ['jobTitle', 'companyName', 'interviewDate', 'status', 'result', 'feedback', 'actions'];
  displayedColumnsCareerFairs: string[] = ['title', 'date', 'location', 'description'];

  // For enum access in the template
  InterviewStatus = InterviewStatus;
  InterviewResult = InterviewResult;
  ApplicationStatus = ApplicationStatus;

  constructor(private apiService: ApiService, private authService: AuthService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadCareerFairs();
    this.loadAllJobs();    
    
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        console.log("User authenticated:", user.firstName, user.lastName, "ID:", user.id);
        this.loadStudentApplications(user.id);
        this.loadStudentInterviews(user.id);
      } else {
        console.log("No authenticated user found");
        this.applications = [];
        this.interviews = [];
        this.upcomingInterviews = [];
      }
    });
  }

  private loadAllJobs(): void {
    this.apiService.getJobs().subscribe({
      next: jobs => {
        console.log('Jobs loaded:', jobs);
        this.jobs = jobs;
        this.markApplied();
      },
      error: err => {
        console.error('Error loading jobs:', err);
      }
    });
  }

  applyToJob(job: JobListing): void {
    const user = this.authService.currentUser;
    if (!user) return;  // not logged in
  
    // Create proper Application object that matches backend expectations
    const applicationPayload = {
      student: { studentId: user.id },
      job: { jobId: job.jobId },
      applicationDate: new Date().toISOString().split('T')[0],
      status: 'PENDING'
    };
  
    this.apiService.postApplication(applicationPayload).subscribe({
      next: () => {
        console.log(`Applied to job ${job.jobId}`);
        
        // Mark this job as applied
        job.hasApplied = true;
        
        // Show success notification
        this.snackBar.open('Successfully applied to job!', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        
        // Refresh the applications list
        this.loadStudentApplications(user.id);
      },
      error: err => {
        console.error('Error applying to job:', err);
        
        // Show error notification
        this.snackBar.open('Already applied.', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
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

  private loadStudentInterviews(userId: number): void {
    console.log("Loading interviews for user ID:", userId);
    this.apiService.getInterviewsByStudent(userId.toString()).subscribe({
      next: (data) => {
        console.log("Interviews loaded successfully, raw data:", JSON.stringify(data[0], null, 2));
        
        // Process each interview to make sure nested objects are properly handled
        this.interviews = data.map(interview => {
          // Check if we need to fix null nested objects
          if (interview && !interview.application?.job?.company && interview.application?.job) {
            console.log("Missing company in job, setting default");
            interview.application.job.company = {
              companyId: 0,
              name: 'Unknown Company',
              industry: 'Unknown'
            };
          }
          return interview;
        });
        
        console.log("Processed interviews:", this.interviews);
      },
      error: (err) => {
        console.error('Error loading interviews:', err);
      }
    });
  }
  
  private loadStudentApplications(userId: number): void {
    console.log("Loading applications for user ID:", userId);
    this.apiService.getApplicationsByStudent(userId.toString()).subscribe({
      next: (data) => {
        console.log("Applications loaded successfully, raw data:", JSON.stringify(data[0], null, 2));
        
        // Process each application to make sure nested objects are properly handled
        this.applications = data.map(application => {
          // Check if we need to fix null nested objects
          if (application && !application.job?.company && application.job) {
            console.log("Missing company in job, setting default");
            application.job.company = {
              companyId: 0,
              name: 'Unknown Company',
              industry: 'Unknown'
            };
          }
          return application;
        });
        this.markApplied();
        
        console.log("Processed applications:", this.applications);
      },
      error: (err) => {
        console.error('Error loading applications:', err);
      }
    });
  }

  private markApplied(): void {
    if (!this.jobs || !this.applications) return;
    const appliedJobIds = new Set(this.applications.map(a => a.job.jobId));
    this.jobs.forEach(job => {
      job.hasApplied = appliedJobIds.has(job.jobId);
    });
  }


  formatJobType(jobType: JobType | string): string {
    if (!jobType) return 'N/A';
    
    switch(jobType) {
      case JobType.FULL_TIME:
        return 'Full-time';
      case JobType.PART_TIME:
        return 'Part-time';
      case JobType.INTERNSHIP:
        return 'Internship';
      default:
        return String(jobType);
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  formatDateTime(dateString: string): string {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatSalary(salary: number): string {
    if (!salary) return 'Not specified';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(salary);
  }

  getStatusClass(status: InterviewStatus | string): string {
    if (!status) return 'status-unknown';
    
    switch(status) {
      case InterviewStatus.SCHEDULED:
        return 'status-scheduled';
      case InterviewStatus.COMPLETED:
        return 'status-completed';
      case InterviewStatus.CANCELLED:
        return 'status-cancelled';
      case InterviewStatus.RESCHEDULED:
        return 'status-rescheduled';
      default:
        return 'status-unknown';
    }
  }

  getResultClass(result: InterviewResult | string): string {
    if (!result) return 'result-pending';
    
    switch(result) {
      case InterviewResult.PASSED:
        return 'result-passed';
      case InterviewResult.REJECTED:
        return 'result-rejected';
      case InterviewResult.PENDING:
      default:
        return 'result-pending';
    }
  }
  
  formatStatus(status: string): string {
    if (!status) return 'N/A';
    
    // Convert SNAKE_CASE to Title Case
    return status.split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  }


}