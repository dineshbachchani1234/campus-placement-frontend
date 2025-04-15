import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-job-details',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './job-details.component.html',
  styleUrls: ['./job-details.component.css']
})
export class JobDetailsComponent {
  // Example job details. In production, get data from route parameters or a service.
  job = {
    title: 'Software Developer',
    location: 'Campus',
    description: 'Detailed job description goes here.',
    qualifications: 'Required qualifications.',
    responsibilities: 'List of job responsibilities.'
  };
}
