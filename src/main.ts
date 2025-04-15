import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

// Import the main App Component.
import { AppComponent } from './app/app.component';

// Import all individual components.
import { HomeComponent } from './app/components/home/home.component';
import { RegistrationComponent } from './app/components/registration/registration.component';
import { LoginComponent } from './app/components/login/login.component';
import { DashboardComponent } from './app/components/dashboard/dashboard.component';
import { JobListComponent } from './app/components/job-list/job-list.component';
import { JobDetailsComponent } from './app/components/job-details/job-details.component';
import { ApplicationComponent } from './app/components/application/application.component';
import { EmployerDashboardComponent } from './app/components/employer-dashboard/employer-dashboard.component';
import { JobPostingComponent } from './app/components/job-posting/job-posting.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter([
      // Landing/Home page.
      { path: '', component: HomeComponent },
      // Registration page.
      { path: 'register', component: RegistrationComponent },
      // Login page.
      { path: 'login', component: LoginComponent },
      // User Dashboard.
      { path: 'dashboard', component: DashboardComponent },
      // Job List page.
      { path: 'job-list', component: JobListComponent },
      // Job Details page with an id parameter (for dynamic job details).
      { path: 'job-details/:id', component: JobDetailsComponent },
      // Application page to apply for a job.
      { path: 'application', component: ApplicationComponent },
      // Employer Dashboard page.
      { path: 'employer-dashboard', component: EmployerDashboardComponent },
      // Job Posting page for employers to create a new job posting.
      { path: 'job-posting', component: JobPostingComponent },
      // You can add more routes as needed.
    ])
  ]
}).catch(err => console.error(err));
