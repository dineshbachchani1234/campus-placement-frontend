import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
// Optionally import MatSnackBar for feedback
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';  // Import MatSelectModule


@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    MatSelectModule
  ],
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent {
  registrationForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    // Build the form. The confirmPassword field is for client-side validation only.
    this.registrationForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      role: ['STUDENT', Validators.required]  // Updated default value to uppercase
    }, { validators: this.passwordMatchValidator });
  }

  // Custom validator to check that password and confirmPassword match.
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.registrationForm.valid) {
      // Prepare the data to send. Exclude confirmPassword.
      const { confirmPassword, ...registrationData } = this.registrationForm.value;
      this.apiService.registerUser(registrationData).subscribe({
        next: response => {
          console.log('Registration successful:', response);
          // Optionally show a success message
          this.snackBar.open('Registration successful! Please log in.', 'Close', { duration: 3000 });
          // Navigate to the Login page on success.
          this.router.navigate(['/login']);
        },
        error: err => {
          console.error('Registration error:', err);
          this.snackBar.open('Registration failed. Please try again.', 'Close', { duration: 3000 });
        }
      });
    } else {
      console.log('Registration form is invalid.');
    }
  }
}
