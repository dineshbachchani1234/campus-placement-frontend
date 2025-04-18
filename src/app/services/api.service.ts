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
import { Student } from '../models/student.model'; // Added Student import
import { InterviewExperience } from '../models/interview-experience.model';
import { Sponsor } from '../models/sponsor.model';
import { CampusEvent } from '../models/campus-event.model';
import { Skill } from '../models/skill.model';
import { Certification } from '../models/certification.model';
import { PlacementReport } from '../models/placement-report.model';
import { College } from '../models/college.model';

// Define a type for the event payload matching backend DTO structure
type EventPayload = {
  eventId?: number;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  location: string;
  companies: { companyId?: number; name?: string }[];
  sponsors: { sponsorId?: number; name?: string }[];
  admin: { adminId: number };
};

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // Update baseUrl to point to your Spring Boot backend
  private baseUrl = 'http://localhost:8080/api';

  private collegeBaseUrl = 'http://localhost:8080/api/colleges';

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

  getInterviewsByJobId(jobId: string): Observable<Interview[]> {
    return this.http.get<Interview[]>(`${this.apiUrl}/interviews/job/${jobId}`);
  }
  

  getApplicationsByJobId(jobId: string): Observable<Application[]> {
    return this.http.get<Application[]>(
      `${this.applicationBaseUrl}/jobs/${jobId}`
    );
  }

  // --- New methods for Recruiter Dashboard ---

  /** Fetches student details for all applicants of a specific job */
  getApplicantsForJob(jobId: string): Observable<Student[]> {
    // Assuming backend endpoint is /api/jobs/{jobId}/applicants
    return this.http.get<Student[]>(`${this.baseUrl}/jobs/${jobId}/applicants`);
  }

  /** Schedules a new interview */
  // Updated parameter type to include recruiterId
  scheduleInterview(interviewData: { jobId: number; studentId: number; recruiterId: number; dateTime: string; notes?: string }): Observable<Interview> {
    // Assuming backend endpoint is /api/interviews
    return this.http.post<Interview>(`${this.baseUrl}/interviews`, interviewData);
  }

  // --- End of new methods ---


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

  getPlacementReports(): Observable<PlacementReport[]> {
    return this.http.get<PlacementReport[]>(`${this.collegeBaseUrl}/placement-reports`);
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
  getColleges(): Observable<College[]> {
    return this.http.get<College[]>(`${this.baseUrl}/colleges`);
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

  getAllCareerFairs(): Observable<CareerFair[]> {
    return this.http.get<CareerFair[]>(`${this.baseUrl}/careerfairs`);
  }

  createCareerFair(fair: Partial<CareerFair>): Observable<CareerFair> {
    return this.http.post<CareerFair>(`${this.baseUrl}/careerfairs`, fair);
  }

  updateCareerFair(fair: CareerFair): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/careerfairs/${fair.eventId}`, fair);
  }

  deleteCareerFair(fairId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/careerfairs/${fairId}`);
  }

  getAllEvents(): Observable<CampusEvent[]> {
    return this.http.get<CampusEvent[]>(`${this.baseUrl}/events`);
  }

  // Type definition moved outside the class

  createEvent(ev: EventPayload): Observable<CampusEvent> { // Use EventPayload type
    return this.http.post<CampusEvent>(`${this.baseUrl}/events`, ev);
  }
  updateEvent(ev: EventPayload): Observable<void> { // Use EventPayload type
    return this.http.put<void>(`${this.baseUrl}/events/${ev.eventId}`, ev);
  }
  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/events/${id}`);
  }

  checkEmailAvailability(email: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/auth/check-email?email=${encodeURIComponent(email)}`);
  }

  // --- Student Skills ---

  getStudentSkills(studentId: string): Observable<Skill[]> {
    return this.http.get<Skill[]>(`${this.baseUrl}/students/${studentId}/skills`);
  }

  addStudentSkill(studentId: string, skillData: { name: string, description?: string }): Observable<Skill> {
    return this.http.post<Skill>(`${this.baseUrl}/students/${studentId}/skills`, skillData);
  }

  deleteStudentSkill(studentId: string, skillId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/students/${studentId}/skills/${skillId}`);
  }

  // --- Student Certifications ---

  getStudentCertifications(studentId: string): Observable<Certification[]> {
    return this.http.get<Certification[]>(`${this.baseUrl}/students/${studentId}/certifications`);
  }

  // Updated certData type to 'any' to allow sending the full DTO object
  addStudentCertification(studentId: string, certData: any): Observable<Certification> {
    return this.http.post<Certification>(`${this.baseUrl}/students/${studentId}/certifications`, certData);
  }

  deleteStudentCertification(studentId: string, certificationId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/students/${studentId}/certifications/${certificationId}`);
  }

}
