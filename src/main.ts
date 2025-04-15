import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import {importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app/app.component';
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
    importProvidersFrom(HttpClientModule),
    provideRouter([
      { path: '', component: HomeComponent },
      { path: 'register', component: RegistrationComponent },
      { path: 'login', component: LoginComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'job-list', component: JobListComponent },
      { path: 'job-details/:id', component: JobDetailsComponent },
      { path: 'application', component: ApplicationComponent },
      { path: 'employer-dashboard', component: EmployerDashboardComponent },
      { path: 'job-posting', component: JobPostingComponent },
      // Other routes as needed.
    ])
  ]
}).catch(err => console.error(err));
