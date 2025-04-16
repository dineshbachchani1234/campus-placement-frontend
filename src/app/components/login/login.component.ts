import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
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
    MatSnackBarModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm!: FormGroup;

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

      this.apiService.login(loginRequest).subscribe({
        next: (response) => {
          console.log('Login successful:', response);
  
          // Save token and user info to localStorage
          localStorage.setItem('token', response.accessToken);
          localStorage.setItem('tokenType', response.tokenType);
          localStorage.setItem('userId', response.userId.toString());
          localStorage.setItem('email', response.email);
          localStorage.setItem('role', response.role);
          
          console.log('ROLE:', response.role);
          
          this.snackBar.open('Login successful!', 'Close', { duration: 3000 });
          
          // Navigate based on role
          if (response.role === 'STUDENT') {
            this.router.navigate(['/dashboard']);
          } else if (response.role === 'RECRUITER') {
            this.router.navigate(['/recruiter-dashboard']);
          } else if (response.role === 'ADMIN') {
            this.router.navigate(['/admin']);
          }
        },
        error: (err) => {
          console.error('Login error:', err);
          let errorMessage = 'Login failed';
          
          if (err.error && err.error.message) {
            errorMessage = err.error.message;
          }
          
          this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
        }
      });
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }
}