import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // Update baseUrl to point to your Spring Boot backend
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }

  // API call for user registration
  registerUser(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, userData);
  }

  // API call for user login
  loginUser(credentials: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, credentials);
  }

  // API call for fetching list of jobs
  getJobs(): Observable<any> {
    return this.http.get(`${this.baseUrl}/jobs`);
  }

  // API call for posting a new job (for employers)
  postJob(jobData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/jobs`, jobData);
  }

  // API call for fetching job details by ID
  getJobDetails(jobId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/jobs/${jobId}`);
  }

  // API call to update an existing job posting
  updateJob(jobData: any): Observable<any> {
    // Assume jobData contains an id field
    return this.http.put(`${this.baseUrl}/jobs/${jobData.id}`, jobData);
  }

  // API call to delete a job posting (for employers)
  deleteJob(jobId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/jobs/${jobId}`);
  }

  // API call for submitting a job application (for candidates)
  postApplication(applicationData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/applications`, applicationData);
  }

  // API call to retrieve all applications or filter by criteria on the backend
  getApplications(): Observable<any> {
    return this.http.get(`${this.baseUrl}/applications`);
  }

  // API call to retrieve applications for a specific job (for employer use)
  getApplicationsByJob(jobId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/jobs/${jobId}/applications`);
  }

  // API call to get user profile details by user id
  getUserById(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/users/${userId}`);
  }

  // API call to update user profile information
  updateUser(userData: any): Observable<any> {
    // Assume userData contains an id field
    return this.http.put(`${this.baseUrl}/users/${userData.id}`, userData);
  }
}
