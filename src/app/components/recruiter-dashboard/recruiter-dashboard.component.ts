import { Component, OnInit } from '@angular/core';
import { CommonModule }             from '@angular/common';
import { MatCardModule }            from '@angular/material/card';
import { MatTableModule }           from '@angular/material/table';
import { MatButtonModule }          from '@angular/material/button';
import { MatIconModule }            from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar }              from '@angular/material/snack-bar';

import { ApiService }  from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Student }     from '../../models/student.model'; // Added Student model import
import { JobListing, JobType }  from '../../models/job-listing.model'; // Added JobType import
import { FormsModule }             from '@angular/forms';
import { MatFormFieldModule }  from '@angular/material/form-field';
import { MatInputModule }      from '@angular/material/input';
import { MatSelectModule }     from '@angular/material/select';
// Removed duplicate JobType import

@Component({
  selector: 'app-recruiter-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule
  ],
  templateUrl: './recruiter-dashboard.component.html',
  styleUrls: ['./recruiter-dashboard.component.css']
})
export class RecruiterDashboardComponent implements OnInit {
  jobs: Array<JobListing & { applicantCount: number }> = [];
  loading = true;
  selectedJob: JobListing | null = null; // Track selected job
  applicants: Student[] = [];           // Store applicants for selected job
  loadingApplicants = false;            // Loading state for applicants
  showInterviewFormForApplicant: Student | null = null; // Track which applicant's form is open
  interviewDetails = { date: '', time: '', notes: '' }; // Model for interview form

  displayedColumns = [
    'title',
    'jobType',
    'salary',
    'applicantCount',
    'actions'
  ];

  showAddForm = false;
  editingJobId: number | null = null;

  jobTypes = Object.values(JobType);
  newJob: Partial<JobListing> = {
    title: '',
    description: '',
    salary: 0,
    jobType: this.jobTypes[0],
    deadline: ''
  };

  editJob: Partial<JobListing> = {
    title: '',
    description: '',
    salary: 0,
    jobType: this.jobTypes[0],
    deadline: ''
  };

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const user = this.auth.currentUser;
    if (!user) {
      this.loading = false;
      this.snackBar.open('Not authenticated', 'Close', { duration: 3000 });
      return;
    }

    // 1) load jobs posted by this recruiter
    this.api.getJobsByRecruiter(user.id.toString()).subscribe({
      next: jobList => {
        // initialize applicantCount
        this.jobs = jobList.map(job => ({ ...job, applicantCount: 0 }));
        // 2) for each job, fetch its applications and count
        this.jobs.forEach(job =>
          this.api.getApplicationsByJobId(job.jobId.toString())
            .subscribe(apps => job.applicantCount = apps.length)
        );
      },
      error: err => {
        console.error('Failed to load recruiter jobs', err);
        this.snackBar.open('Error loading jobs', 'Close', { duration: 3000 });
      },
      complete: () => this.loading = false
    });
  }

  startEdit(job: JobListing & { applicantCount: number }) {
    this.showAddForm = true;
    this.editingJobId = job.jobId;
    this.editJob = {
      title:       job.title,
      description: job.description,
      salary:      job.salary,
      jobType:     job.jobType,
      deadline:    job.deadline
    };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit() {
    this.showAddForm = false;
    this.editingJobId = null;
    this.resetNewJob();
  this.resetEditJob();
  }

  private resetForm() {
    this.newJob = {
      title:       '',
      description: '',
      salary:      0,
      jobType:     this.jobTypes[0],
      deadline:    ''
    };
  }


  /** Fetch and display applicants for the selected job */
  viewApplicants(job: JobListing & { applicantCount: number }) {
    this.selectedJob = job;
    this.applicants = []; // Clear previous applicants
    this.loadingApplicants = true;
    this.showInterviewFormForApplicant = null; // Close any open interview forms

    this.api.getApplicantsForJob(job.jobId.toString()).subscribe({
      next: (students) => {
        this.applicants = students;
        this.loadingApplicants = false;
      },
      error: (err) => {
        console.error('Failed to load applicants', err);
        this.snackBar.open('Error loading applicants', 'Close', { duration: 3000 });
        this.loadingApplicants = false;
      }
    });
  }

  /** Opens the interview scheduling form for a specific applicant */
  openScheduleInterviewForm(applicant: Student) {
    this.showInterviewFormForApplicant = applicant;
    this.interviewDetails = { date: '', time: '', notes: '' }; // Reset form
  }

  /** Cancels the interview scheduling form */
  cancelScheduleInterview() {
    this.showInterviewFormForApplicant = null;
  }

  /** Submits the interview schedule to the backend */
  submitScheduleInterview() {
    if (!this.showInterviewFormForApplicant || !this.selectedJob || !this.interviewDetails.date || !this.interviewDetails.time) {
      this.snackBar.open('Please fill in date and time.', 'Close', { duration: 3000 });
      return;
    }

    // Combine date and time into an ISO string or suitable format for backend
    // Basic combination, adjust if backend expects a different format or timezone handling
    const dateTimeString = `${this.interviewDetails.date}T${this.interviewDetails.time}:00`; // Assuming local time

    // Ensure currentUser and its ID are available
    if (!this.auth.currentUser || this.auth.currentUser.id == null) {
      this.snackBar.open('Cannot determine recruiter ID. Please log in again.', 'Close', { duration: 3000 });
      return;
    }

    const interviewData = {
      jobId: this.selectedJob.jobId,
      studentId: this.showInterviewFormForApplicant.studentId, // Ensure Student model has studentId
      recruiterId: this.auth.currentUser.id, // Add recruiter ID from auth service
      dateTime: dateTimeString,
      notes: this.interviewDetails.notes
    };

    this.api.scheduleInterview(interviewData).subscribe({
      next: (interview) => {
        this.snackBar.open(`Interview scheduled for ${this.showInterviewFormForApplicant?.firstName}`, 'Close', { duration: 3000 });
        this.cancelScheduleInterview(); // Close form on success
        // Optionally: Update UI to reflect scheduled interview (e.g., disable button)
      },
      error: (err) => {
        console.error('Failed to schedule interview', err);
        this.snackBar.open('Error scheduling interview', 'Close', { duration: 3000 });
      }
    });
  }


  deleteJob(job: JobListing & { applicantCount: number }) {
    if (!confirm(`Delete job “${job.title}”? This cannot be undone.`)) {
      return;
    }
    this.api.deleteJob(job.jobId.toString()).subscribe({
      next: () => {
        this.snackBar.open('Job deleted', 'Close', { duration: 3000 });
        // remove it from the local array so the table updates immediately
        this.jobs = this.jobs.filter(j => j.jobId !== job.jobId);
      },
      error: err => {
        console.error('Delete failed', err);
        this.snackBar.open('Failed to delete job', 'Close', { duration: 3000 });
      }
    });
  }

  formatSalary(salary: number): string {
    if (salary == null) return '–';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(salary);
  }

 formatJobType(jobType: JobType | string): string {
  switch (jobType) {
     case JobType.FULL_TIME:   return 'Full-time';
     case JobType.PART_TIME:   return 'Part-time';
     case JobType.INTERNSHIP:  return 'Internship';
     default:                  return String(jobType || 'N/A');
   }
 }
 addJob(): void {
  const user = this.auth.currentUser;
  const payload = {
    ...this.newJob,
    postDate: new Date().toISOString().split('T')[0],
    isActive: true,
    company: { companyId: this.auth.currentUser!.id! }
  };

  this.api.postJob(payload).subscribe({
    next: created => {
      this.snackBar.open('Job added!', 'Close', { duration: 3000 });
      this.jobs.push({ ...created, applicantCount: 0 });
      this.showAddForm = false;
      this.ngOnInit(); // Consider using a more efficient way to refresh data
      this.resetNewJob();
    },
    error: err => {
      console.error('Add job failed', err);
      this.snackBar.open('Failed to add job', 'Close', { duration: 3000 });
    }
  });
}

updateJob(): void {
  if (this.editingJobId == null) return;
  const payload = {
    id: this.editingJobId,
    jobId: this.editingJobId,
    title:       this.editJob.title,
    description: this.editJob.description,
    salary:      this.editJob.salary,
    jobType:     this.editJob.jobType,
    deadline:    this.editJob.deadline,
    postDate:    new Date().toISOString().split('T')[0],
    isActive:    true,
    company:     { companyId: this.auth.currentUser!.id! }
  };
  
  this.api.updateJob(payload).subscribe({
    next: () => {
      this.snackBar.open('Job updated!', 'Close', { duration: 3000 });
      this.ngOnInit();
      this.cancelEdit();
    },
    error: err => {
      console.error('Update failed', err);
      this.snackBar.open('Failed to update job', 'Close', { duration: 3000 });
    }
  });
}

private resetNewJob() {
  this.newJob = {
    title: '',
    description: '',
    salary: 0,
    jobType: this.jobTypes[0],
    deadline: ''
  };
}

private resetEditJob() {
  this.editJob = {
    title: '',
    description: '',
    salary: 0,
    jobType: this.jobTypes[0],
    deadline: ''
  };
}

toggleAddForm(): void {
  // If we're already editing, cancel the edit first
  if (this.editingJobId !== null) {
    this.cancelEdit();
  }
  
  // Toggle the add form
  this.showAddForm = !this.showAddForm;
  
  // If we're showing the form, reset it
  if (this.showAddForm) {
    this.resetNewJob();
  }
}

cancelAddForm(): void {
  this.showAddForm = false;
  this.resetNewJob();
}


}
