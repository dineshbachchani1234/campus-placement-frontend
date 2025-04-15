import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.css']
})
export class JobListComponent {
  // Example static job data. In a real app, this comes from a service.
  jobs = [
    { title: 'Software Developer', location: 'Campus', description: 'Develop and maintain software applications.' },
    { title: 'Data Analyst', location: 'Campus', description: 'Analyze data and generate reports.' }
  ];
}
