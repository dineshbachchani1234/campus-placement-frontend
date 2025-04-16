import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

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
    MatRadioModule,
    MatSnackBarModule
  ],
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {
  registrationForm!: FormGroup;
  companyOptions: {companyId: number, companyName: string}[] = [];
  
  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit(): void {
    this.initForm();
    this.loadCompanies();
  }
  
  initForm(): void {
    this.registrationForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      role: ['STUDENT', Validators.required],
      
      // Student specific fields
      collegeId: [1], // Default value, matches an existing ID in your database
      collegeName: [''], // New field for text input
      major: [''],
      gpa: [''],
      resume: [''],
      
      // Recruiter specific fields
      companyId: [null],
      position: ['']
    }, { validators: this.passwordMatchValidator });
    
    // Watch for role changes to update validation
    this.registrationForm.get('role')?.valueChanges.subscribe(role => {
      this.updateValidationForRole(role);
    });
    
    // Initialize validation for default role
    this.updateValidationForRole(this.registrationForm.get('role')?.value);
  }
  
  updateValidationForRole(role: string): void {
    const collegeNameControl = this.registrationForm.get('collegeName');
    const majorControl = this.registrationForm.get('major');
    const gpaControl = this.registrationForm.get('gpa');
    const companyIdControl = this.registrationForm.get('companyId');
    const positionControl = this.registrationForm.get('position');
    
    // Reset validators
    collegeNameControl?.clearValidators();
    majorControl?.clearValidators();
    gpaControl?.clearValidators();
    companyIdControl?.clearValidators();
    positionControl?.clearValidators();
    
    if (role === 'STUDENT') {
      collegeNameControl?.setValidators([Validators.required]);
      majorControl?.setValidators([Validators.required]);
      gpaControl?.setValidators([Validators.required, Validators.pattern(/^[0-4](\.\d{1,2})?$/)]);
    } else if (role === 'RECRUITER') {
      companyIdControl?.setValidators([Validators.required]);
      positionControl?.setValidators([Validators.required]);
    }
    
    // Update validity
    collegeNameControl?.updateValueAndValidity();
    majorControl?.updateValueAndValidity();
    gpaControl?.updateValueAndValidity();
    companyIdControl?.updateValueAndValidity();
    positionControl?.updateValueAndValidity();
  }
  
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }
  
  onSubmit(): void {
    if (this.registrationForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.registrationForm.controls).forEach(key => {
        this.registrationForm.get(key)?.markAsTouched();
      });
      return;
    }
    
    const formValues = this.registrationForm.value;
    
    // Create signup request based on the selected role
    const signupRequest = {
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      email: formValues.email,
      password: formValues.password,
      role: formValues.role
    };
    
    // Add role-specific fields
    if (formValues.role === 'STUDENT') {
      signupRequest['collegeId'] = formValues.collegeId;
      signupRequest['major'] = formValues.major;
      signupRequest['gpa'] = formValues.gpa;
      signupRequest['resume'] = formValues.resume || 'No resume provided';
    } else if (formValues.role === 'RECRUITER') {
      signupRequest['companyId'] = formValues.companyId;
      signupRequest['position'] = formValues.position;
    }
    
    this.apiService.registerUser(signupRequest).subscribe({
      next: (response) => {
        this.snackBar.open('Registration successful!', 'Close', { duration: 3000 });
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Registration error:', error);
        let errorMessage = 'Registration failed';
        
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }
        
        this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
      }
    });
  }
  
  // Helper methods for loading dropdown options
  loadCompanies(): void {
    this.apiService.getCompanies().subscribe({
      next: (data) => {
        this.companyOptions = data;
        console.log('Loaded companies:', this.companyOptions);
      },
      error: (error) => {
        console.error('Error loading companies:', error);
        // Fallback data if API fails
        this.companyOptions = [
          { companyId: 1, companyName: 'TechInc' },
          { companyId: 2, companyName: 'GlobalSoft' },
          { companyId: 3, companyName: 'InnovaTech' },
          { companyId: 4, companyName: 'DataForge' }
        ];
      }
    });
  }
}