import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { InterviewExperience } from '../../models/interview-experience.model';
import { InterviewExperienceDialogComponent } from '../interview-experience/interview-experience.component';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { MatIconModule } from '@angular/material/icon';
import { InterviewExperienceService } from '../../services/interview-experience.service';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, 
    MatTableModule, MatChipsModule, MatBadgeModule, 
    MatButtonModule,
    MatDialogModule,
    MatPaginatorModule,
    CarouselModule ,
    MatIconModule
  ],
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
  displayedColumnsApplications: string[] = ['jobTitle', 'companyName', 'jobType', 'salary', 'status', 'applicationDate', 'deadline', 'actions'];

  // Update column definitions to match the data structure
  displayedColumnsInterviews: string[] = ['jobTitle', 'companyName', 'interviewDate', 'status', 'result', 'feedback', 'actions'];
  displayedColumnsCareerFairs: string[] = ['title', 'date', 'location', 'description'];

  // For enum access in the template
  InterviewStatus = InterviewStatus;
  InterviewResult = InterviewResult;
  ApplicationStatus = ApplicationStatus;

  interviewExperiences: InterviewExperience[] = [];

  @ViewChild('experiencesDialog') experiencesDialog!: TemplateRef<any>;

carouselOptions: OwlOptions = {
  loop: true,
  mouseDrag: true,
  touchDrag: true,
  pullDrag: false,
  dots: true,
  navSpeed: 700,
  navText: ['<i class="material-icons">arrow_back</i>', '<i class="material-icons">arrow_forward</i>'],
  responsive: {
    0: {
      items: 1
    },
    740: {
      items: 2
    },
    940: {
      items: 3
    }
  },
  nav: true,
  autoplay: true,
  autoplayTimeout: 5000,
  autoplayHoverPause: true
};

  pageSizeOptions: number[] = [5, 10, 25];
  pageSize: number = 5;

  applicationsPageIndex: number = 0;
  paginatedApplications: Application[] = [];

  interviewsPageIndex: number = 0;
  paginatedInterviews: Interview[] = [];

// For career fairs pagination
  careerFairsPageIndex: number = 0;
  paginatedCareerFairs: CareerFair[] = [];

// For jobs pagination
  jobsPageIndex: number = 0;
  paginatedJobs: JobListing[] = [];

  constructor(private apiService: ApiService, private authService: AuthService, 
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private interviewExperienceService: InterviewExperienceService) {}

  ngOnInit(): void {
    this.loadCareerFairs();
    this.loadAllJobs();

    this.loadInterviewExperiences();
    
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        console.log("User authenticated:", user.firstName, user.lastName, "ID:", user.id);
        this.loadStudentApplications(user.id);
        this.loadStudentInterviews(user.id);
        this.updatePaginatedData();
      } else {
        console.log("No authenticated user found");
        this.applications = [];
        this.interviews = [];
        this.upcomingInterviews = [];
        this.updatePaginatedData();
      }
    });
  }

  private loadAllJobs(): void {
    this.apiService.getJobs().subscribe({
      next: jobs => {
        console.log('Jobs loaded:', jobs);
        this.jobs = jobs;
        this.markApplied();
        this.updatePaginatedJobs();
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
        this.updatePaginatedCareerFairs();
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
              companyName: 'Unknown Company',
              industry: 'Unknown'
            };
          }
          return interview;
        });
        
        console.log("Processed interviews:", this.interviews);
        this.updatePaginatedInterviews();
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
              companyName: 'Unknown Company',
              industry: 'Unknown'
            };
          }
          return application;
        });
        this.markApplied();
        
        console.log("Processed applications:", this.applications);
        this.updatePaginatedApplications(); 
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

  withdrawApplication(application: Application): void {
    if (!application || !application.applicationId) {
      this.snackBar.open('Cannot withdraw application: Invalid application', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      return;
    }
    
    // Confirm before withdrawing
    if (confirm('Are you sure you want to withdraw this application?')) {
      this.apiService.withdrawApplication(application.applicationId).subscribe({
        next: () => {
          console.log(`Withdrawn application ${application.applicationId}`);
          
          // Remove from the applications array
          this.applications = this.applications.filter(app => app.applicationId !== application.applicationId);
          
          // Update job status if present in jobs array
          const job = this.jobs.find(j => j.jobId === application.job.jobId);
          if (job) {
            job.hasApplied = false;
          }
          
          // Show success notification
          this.snackBar.open('Application withdrawn successfully', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        },
        error: err => {
          console.error('Error withdrawing application:', err);
          
          // Show error notification
          this.snackBar.open('Failed to withdraw application', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        }
      });
    }
  }

  addInterviewExperience(interview: Interview): void {
    if (!interview || !interview.interviewId) {
      this.snackBar.open('Cannot add experience: Invalid interview data', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      return;
    }
  
    const dialogRef = this.dialog.open(InterviewExperienceDialogComponent, {
      width: '550px',
      data: { interview }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const user = this.authService.currentUser;
        if (!user) {
          this.snackBar.open('You must be logged in to share experiences', 'Close', {
            duration: 3000
          });
          return;
        }
  
        // Format the data according to your backend requirements
        const experienceData: InterviewExperience = {
          interview: {
            interviewId: interview.interviewId
          },
          student: {
            studentId: user.id
          },
          comment: result.comment,
          rating: result.rating
        };
  
        this.apiService.addInterviewExperience(experienceData).subscribe({
          next: (response) => {
            console.log('Interview experience added:', response);
            
            // Show success message
            this.snackBar.open('Experience shared successfully! Thank you for helping others.', 'Close', {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
          },
          error: (err) => {
            console.error('Error adding interview experience:', err);
            
            // Show error message
            this.snackBar.open(
              'Failed to share experience. Please try again later.', 
              'Close', 
              {
                duration: 5000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
              }
            );
          }
        });
      }
    });
  }

  onApplicationsPageChange(event: PageEvent): void {
    this.applicationsPageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedApplications();
  }
  
  onInterviewsPageChange(event: PageEvent): void {
    this.interviewsPageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedInterviews();
  }
  
  onCareerFairsPageChange(event: PageEvent): void {
    this.careerFairsPageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedCareerFairs();
  }
  
  onJobsPageChange(event: PageEvent): void {
    this.jobsPageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedJobs();
  }
  
  // Add methods to update paginated data
  updatePaginatedData(): void {
    this.updatePaginatedApplications();
    this.updatePaginatedInterviews();
    this.updatePaginatedCareerFairs();
    this.updatePaginatedJobs();
  }
  
  updatePaginatedApplications(): void {
    const start = this.applicationsPageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedApplications = this.applications.slice(start, end);
  }
  
  updatePaginatedInterviews(): void {
    const start = this.interviewsPageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedInterviews = this.interviews.slice(start, end);
  }
  
  updatePaginatedCareerFairs(): void {
    const start = this.careerFairsPageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedCareerFairs = this.careerFairs.slice(start, end);
  }
  
  updatePaginatedJobs(): void {
    const start = this.jobsPageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedJobs = this.jobs.slice(start, end);
  }

  private loadInterviewExperiences(): void {
    this.apiService.getInterviewExperiences().subscribe({
      next: (data) => {
        console.log("Interview experiences loaded:", data);
        this.interviewExperiences = data;
      },
      error: (err) => {
        console.error('Error loading interview experiences:', err);
      }
    });
  }


  viewAllExperiences() {
    // Navigate to a view all experiences page or open a dialog
    // For example:
    // this.router.navigate(['/interview-experiences']);
    // or
    // this.dialog.open(InterviewExperiencesDialogComponent, {
    //   width: '80%',
    //   data: { experiences: this.interviewExperiences }
    // });
  }

  openExperiencesDialog(): void {
    this.dialog.open(this.experiencesDialog, {
      width: '90%',
      maxWidth: '1200px',
      panelClass: 'experiences-dialog'
    });
  }


}