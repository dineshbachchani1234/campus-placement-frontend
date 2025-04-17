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

import { JobListing }  from '../../models/job-listing.model';
import { FormsModule }             from '@angular/forms';
import { MatFormFieldModule }  from '@angular/material/form-field';
import { MatInputModule }      from '@angular/material/input';
import { MatSelectModule }     from '@angular/material/select';
import { JobType }                 from '../../models/job-listing.model'; 

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

  displayedColumns = [
    'title',
    'jobType',
    'salary',
    'applicantCount',
    'actions'
  ];

  showAddForm = false;

  jobTypes = Object.values(JobType);
  newJob: Partial<JobListing> = {
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

  /** Navigate to an applicant review page (implement as needed) */
  viewApplicants(job: JobListing & { applicantCount: number }) {
    // e.g. this.router.navigate([`/recruiter/jobs/${job.jobId}/applications`]);
    console.log('Viewing applicants for job', job.jobId);
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
  // attach any defaults
  const payload = {
    ...this.newJob,
    postDate: new Date().toISOString().split('T')[0],
    isActive: true,
    company: { companyId: this.auth.currentUser!.id! }
  };

  this.api.postJob(payload).subscribe({
    next: created => {
      this.snackBar.open('Job added!', 'Close', { duration: 3000 });
      // refresh list (or simply push):
      this.jobs.push({ ...created, applicantCount: 0 });
      this.showAddForm = false;
      this.ngOnInit();
      // reset form
      this.newJob = {
        title: '',
        description: '',
        salary: 0,
        jobType: this.jobTypes[0],
        deadline: ''
      };
    },
    error: err => {
      console.error('Add job failed', err);
      this.snackBar.open('Failed to add job', 'Close', { duration: 3000 });
    }
  });
}

}
