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
import { Application } from '../../models/application.model';

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
    MatTooltipModule
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
}
