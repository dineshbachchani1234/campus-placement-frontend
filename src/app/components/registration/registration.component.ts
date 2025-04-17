import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { Company } from '../../models/company.model';

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
    MatSelectModule,
    MatIconModule,
    MatRadioModule,
    RouterModule,
    ReactiveFormsModule,
    MatRadioModule
  ],
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {
  registrationForm: FormGroup;
  companies: Company[] = [];
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    // Build the form with enhanced validation
    this.registrationForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [
        Validators.required, 
        Validators.email
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
      confirmPassword: ['', [Validators.required]],
      role: ['STUDENT', [Validators.required]],
      companyId: [{ value: null, disabled: true }, []],
      position: [{ value: '', disabled: true }, []]
    }, { 
      validators: [this.passwordMatchValidator]
    });
  }

  ngOnInit() {
    // Load companies for recruiter dropdown
    this.apiService.getCompanies().subscribe({
      next: comps => this.companies = comps,
      error: err => console.error('Failed to load companies', err)
    });

    // Handle role change to enable/disable company fields
    this.registrationForm.get('role')!.valueChanges
      .subscribe(role => {
        const cid = this.registrationForm.get('companyId')!;
        const pos = this.registrationForm.get('position')!;
        
        if (role === 'RECRUITER') {
          cid.enable();
          cid.setValidators([Validators.required]);
          pos.enable();
          pos.setValidators([Validators.required]);
        } else {
          cid.disable();
          cid.clearValidators();
          pos.disable();
          pos.clearValidators();
        }
        
        cid.updateValueAndValidity();
        pos.updateValueAndValidity();
      });
    }

    // Custom email validation to check if email is already taken
  
    onEmailBlur() {
      const emailCtrl = this.registrationForm.get('email')!;
      const email = emailCtrl.value;
      if (emailCtrl.valid && email) {
        this.apiService.checkEmailAvailability(email).subscribe({
          next: (res: any) => {
            if (res.exists) {
              emailCtrl.setErrors({ emailTaken: true });
            }
          },
          error: (err) => {
            console.error('Email check failed', err);
            // optionally clear the error if the call fails:
            // emailCtrl.setErrors(null);
          }
        });
      }
    }

  // Custom validator to check that password and confirmPassword match
  passwordMatchValidator(form: FormGroup): ValidationErrors | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (password === confirmPassword) {
      return null;
    }
    
    return { mismatch: true };
  }

  onSubmit() {
    if (this.registrationForm.valid) {
      // Show loading indicator or disable the submit button
      const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
      if (submitButton) {
        submitButton.disabled = true;
      }

      // Prepare the data to send. Exclude confirmPassword.
      const { confirmPassword, ...registrationData } = this.registrationForm.value;
      
      this.apiService.registerUser(registrationData).subscribe({
        next: response => {
          console.log('Registration successful:', response);
          // Show success message
          this.snackBar.open('Registration successful! You can now log in.', 'Close', {
            duration: 5000,
            panelClass: 'success-snackbar'
          });
          // Navigate to the Login page on success
          this.router.navigate(['/login']);
        },
        error: err => {
          console.error('Registration error:', err);
          let errorMessage = 'Registration failed. Please try again.';
          
          // Check for specific error messages from the server
          if (err.error && err.error.message) {
            errorMessage = err.error.message;
          }
          
          this.snackBar.open(errorMessage, 'Close', {
            duration: 5000,
            panelClass: 'error-snackbar'
          });
          
          // Re-enable the submit button
          if (submitButton) {
            submitButton.disabled = false;
          }
        }
      });
    } else {
      // Mark all form controls as touched to trigger validation messages
      this.markFormGroupTouched(this.registrationForm);
      
      this.snackBar.open('Please fix the errors in the form before submitting.', 'Close', {
        duration: 5000,
        panelClass: 'error-snackbar'
      });
    }
  }

  // Helper method to mark all controls as touched
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}