import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import {MatRadioModule} from '@angular/material/radio';

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
    MatRadioModule
  ],
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent {
  registrationForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.registrationForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      role: ['student', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.registrationForm.valid) {
      const formValues = this.registrationForm.value;
  
      // Align fields with backend DTO
      const payload = {
        id: 0,
        first_name: formValues.firstName,
        last_name: formValues.lastName,
        username: formValues.email,
        password: formValues.password,
        role: formValues.role.toUpperCase() // e.g., STUDENT, RECRUITER
      };
  
      this.apiService.registerUser(payload).subscribe({
        next: response => {
          console.log('Registration successful:', response);
          this.router.navigate(['/login']);
        },
        error: err => {
          console.error('Registration error:', err);
          // Show user-friendly error (snackbar/dialog/etc.)
        }
      });
    } else {
      console.log('Registration form is invalid.');
    }
  }
}
