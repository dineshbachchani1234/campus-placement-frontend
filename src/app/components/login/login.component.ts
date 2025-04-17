import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm!: FormGroup;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.initForm();
  }


  initForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const loginRequest = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };

      // Show loading state
      const loadingSnackBar = this.snackBar.open('Signing in...', '', {
        duration: undefined,
      });

      this.apiService.login(loginRequest).subscribe({
        next: (response) => {
          // Close loading snackbar
          loadingSnackBar.dismiss();
          
          console.log('Login successful:', response);
  
          // Save token and user info to localStorage
          localStorage.setItem('token', response.accessToken);
          localStorage.setItem('tokenType', response.tokenType);
          localStorage.setItem('userId', response.userId.toString());
          localStorage.setItem('email', response.email);
          localStorage.setItem('role', response.role);
              if (response.role === 'RECRUITER') {
                localStorage.setItem('companyId', response.companyId?.toString() ?? '');
              }
          
          
          this.snackBar.open('Welcome back! Login successful', 'Close', { 
            duration: 3000,
            panelClass: ['success-snackbar']
          });

        // 3) Single navigation call — no more manual refresh
      if (response.role === 'STUDENT') {
        this.router.navigateByUrl('/dashboard', { replaceUrl: true })
  .then(() => window.location.replace('/dashboard'))
          .catch(err => console.error('nav error', err));
      } else if (response.role === 'RECRUITER') {
        this.router.navigateByUrl('/recruiter-dashboard', { replaceUrl: true })
        .then(() => window.location.replace('/recruiter-dashboard'))
          .catch(err => console.error('nav error', err));
      } else if (response.role === 'ADMIN') {
        this.router.navigateByUrl('/admin-dashboard', { replaceUrl: true })
        .then(() => window.location.replace('/admin-dashboard'))
          .catch(err => console.error('nav error', err));
      }
    },
        error: (err) => {
          // Close loading snackbar
          loadingSnackBar.dismiss();
          
          console.error('Login error:', err);
          let errorMessage = 'Login failed';
          
          if (err.error && err.error.message) {
            errorMessage = err.error.message;
          }
          
          this.snackBar.open(errorMessage, 'Close', { 
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }

      });
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      
      this.snackBar.open('Please correct the errors in the form', 'Close', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
    }
  }
}