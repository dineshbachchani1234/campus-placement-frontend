import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
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
    MatCardModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.apiService.loginUser(this.loginForm.value).subscribe({
        next: (response) => {
          console.log('Login successful:', response);
  
          // Save token and user info to localStorage
          localStorage.setItem('token', response.token);
          localStorage.setItem('username', response.username);
          localStorage.setItem('firstName', response.firstName);
          localStorage.setItem('lastName', response.lastName);
          localStorage.setItem('role', response.role);
          console.log('ROLE:', response.role);
          // Navigate based on role
          if (response.role === 'STUDENT') {
            this.router.navigate(['/dashboard']);
          } else if (response.role === 'RECRUITER') {
            this.router.navigate(['/employer-dashboard']);
          } else if (response.role === 'ADMIN') {
            this.router.navigate(['/admin']);
          }
        },
        error: (err) => {
          console.error('Login error:', err);
          // TODO: show a proper error message with a snackbar or dialog
        }
      });
    } else {
      console.log('Login form is invalid.');
    }
  }
}
