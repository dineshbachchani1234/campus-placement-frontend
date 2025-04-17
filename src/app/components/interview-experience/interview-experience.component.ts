import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { Interview } from '../../models/interview.model';
import { InterviewExperience } from '../../models/interview-experience.model';

@Component({
  selector: 'app-interview-experience-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './interview-experience.component.html',
  styleUrls: ['./interview-experience.component.css']
})
export class InterviewExperienceDialogComponent {
  experienceForm: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<InterviewExperienceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { interview: Interview }
  ) {
    this.experienceForm = this.fb.group({
      rating: [null, [Validators.required]],
      comment: ['', [Validators.required, Validators.minLength(10)]]
    });
  }
  
  /**
   * Handles form submission
   * Closes the dialog with form values if valid
   */
  onSubmit(): void {
    if (this.experienceForm.valid) {
      const experienceData: Partial<InterviewExperience> = {
        rating: this.experienceForm.value.rating,
        comment: this.experienceForm.value.comment
      };
      this.dialogRef.close(experienceData);
    }
  }
  
  /**
   * Checks if a form control has a specific error
   */
  hasError(controlName: string, errorName: string): boolean {
    const control = this.experienceForm.get(controlName);
    return control !== null && control.hasError(errorName) && control.touched;
  }
}