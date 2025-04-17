import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string; // Added email property to match backend model
  role: 'STUDENT' | 'ADMIN' | 'RECRUITER'; // Match the backend enum
  token: string;
  companyId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor(private router: Router) {
    let user = null;
    // Check if localStorage is available and build user object from individual fields
    if (typeof localStorage !== 'undefined') {
      const userId = localStorage.getItem('userId');
      const email = localStorage.getItem('email');
      const firstName = localStorage.getItem('firstName') || '';
      const lastName = localStorage.getItem('lastName') || '';
      const role = localStorage.getItem('role');
      const token = localStorage.getItem('token');
      const companyId = localStorage.getItem('companyId');
      
      if (userId && email && role && token) {
        // Create user object from individual localStorage items
        user = {
          id: parseInt(userId),
          firstName: firstName,
          lastName: lastName,
          email: email,
          role: role as 'STUDENT' | 'ADMIN' | 'RECRUITER',
          token: token,
          companyId: companyId ? parseInt(companyId) : undefined
        };
        console.log('Constructed user from localStorage:', user);
      }
    }
    
    this.currentUserSubject = new BehaviorSubject<User | null>(user);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  public get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  login(user: User) {
    console.log('Setting user in login:', user);
    if (typeof localStorage !== 'undefined') {
      // Store individual properties
      localStorage.setItem('userId', user.id.toString());
      localStorage.setItem('firstName', user.firstName);
      localStorage.setItem('lastName', user.lastName);
      localStorage.setItem('email', user.email);
      localStorage.setItem('role', user.role);
      localStorage.setItem('token', user.token);
      localStorage.setItem('tokenType', 'Bearer');
      console.log('User data saved to localStorage');
    }
    this.currentUserSubject.next(user);
  }

  logout() {
    if (typeof localStorage !== 'undefined') {
      // Clear all individual fields
      localStorage.removeItem('userId');
      localStorage.removeItem('firstName');
      localStorage.removeItem('lastName');
      localStorage.removeItem('email');
      localStorage.removeItem('role');
      localStorage.removeItem('token');
      localStorage.removeItem('tokenType');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  isStudent(): boolean {
    return this.currentUser?.role === 'STUDENT';
  }

  isEmployer(): boolean {
    return this.currentUser?.role === 'RECRUITER';
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'ADMIN';
  }
}