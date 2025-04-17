import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SignupRequest } from '../models/signup-request.model';
import { MessageResponse } from '../models/message-response.model';
import { LoginRequest } from '../models/login-request.model';
import { JwtAuthResponse } from '../models/jwt-auth-response.model';
import { CareerFair } from '../models/careerfair.model';
import { Application, JobListing } from '../models/application.model';
import { Interview } from '../models/interview.model';
import { InterviewExperience } from '../models/interview-experience.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // Update baseUrl to point to your Spring Boot backend
  private baseUrl = 'http://localhost:8080/api';

  private applicationBaseUrl = 'http://localhost:8080/api/applications';

  private recruiterBaseUrl = 'http://localhost:8080/api/jobs';

  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }

  registerUser(signupRequest: SignupRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.apiUrl}/auth/signup`, signupRequest);
  }

  login(loginRequest: LoginRequest): Observable<JwtAuthResponse> {
    return this.http.post<JwtAuthResponse>(`${this.apiUrl}/auth/login`, loginRequest);
  }

  getJobsByRecruiter(recruiterId: string): Observable<JobListing[]> {
    return this.http.get<JobListing[]>(
      `${this.recruiterBaseUrl}/recruiter/${recruiterId}`
    );
  }

  getApplicationsByJobId(jobId: string): Observable<Application[]> {
    return this.http.get<Application[]>(
      `${this.applicationBaseUrl}/jobs/${jobId}`
    );
  }



  // API call for fetching list of jobs
  getJobs(): Observable<any> {
    return this.http.get(`${this.baseUrl}/jobs`);
  }

  postJob(jobData: any): Observable<JobListing> {
    return this.http.post<JobListing>(`${this.baseUrl}/jobs`, jobData);
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

  withdrawApplication(applicationId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/applications/${applicationId}`);
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
  getColleges(): Observable<any> {
    return this.http.get(`${this.apiUrl}/colleges`);
  }
  
  // Company methods
  getCompanies(): Observable<any> {
    return this.http.get(`${this.apiUrl}/companies`);
  }

  getCareerFairs(): Observable<CareerFair[]> {
    // Example endpoint: GET /api/career-fairs
    return this.http.get<CareerFair[]>(`${this.baseUrl}/careerfairs`);
  }

  getApplicationsByStudent(studentId: string): Observable<Application[]> {
    // Change this to match your Spring Boot endpoint
    return this.http.get<Application[]>(`${this.baseUrl}/applications/student/${studentId}`);
  }
  getUpcomingInterviews(): Observable<Interview[]> {
    return this.http.get<Interview[]>(`${this.baseUrl}/interviews/upcoming`);
  }
  
  // Make sure you also have this method for getting interviews by student
  getInterviewsByStudent(studentId: string): Observable<Interview[]> {
    return this.http.get<Interview[]>(`${this.baseUrl}/interviews/student/${studentId}`);
  }

  addInterviewExperience(experienceData: InterviewExperience): Observable<InterviewExperience> {
    return this.http.post<InterviewExperience>(
      `${this.baseUrl}/interviews/experiences`, 
      experienceData
    );
  }

  getJobById(jobId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/jobs/${jobId}`);
  }

  getInterviewExperiences(): Observable<InterviewExperience[]> {
    return this.http.get<InterviewExperience[]>(
      `${this.baseUrl}/interviews/experiences`
    );
  }
  
  getCompanyById(companyId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/companies/${companyId}`);
  }
}
