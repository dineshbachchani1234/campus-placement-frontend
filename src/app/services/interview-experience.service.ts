// src/app/services/interview-experience.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InterviewExperience } from '../models/interview-experience.model';

@Injectable({
  providedIn: 'root'
})
export class InterviewExperienceService {
  private baseUrl = 'http://localhost:8080/api/interviews'; // Adjust to your API URL

  constructor(private http: HttpClient) { }

  // Get all interview experiences
  getAllInterviewExperiences(): Observable<InterviewExperience[]> {
    return this.http.get<InterviewExperience[]>(`${this.baseUrl}/experiences`);
  }
}