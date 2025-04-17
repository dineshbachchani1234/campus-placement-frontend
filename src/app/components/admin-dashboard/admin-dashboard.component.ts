import { Component, OnInit }        from '@angular/core';
import { CommonModule }             from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup
} from '@angular/forms';
import { MatCardModule }            from '@angular/material/card';
import { MatTableModule }           from '@angular/material/table';
import { MatFormFieldModule }       from '@angular/material/form-field';
import { MatInputModule }           from '@angular/material/input';
import { MatButtonModule }          from '@angular/material/button';
import { MatDatepickerModule }      from '@angular/material/datepicker';
import { MatNativeDateModule }      from '@angular/material/core';
import { MatSelectModule }          from '@angular/material/select';
import { ApiService }               from '../../services/api.service';
import { MatSnackBar }              from '@angular/material/snack-bar';
import { Company, Sponsor, CampusEvent }  from '../../models/campus-event.model';
import { MatIcon } from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';




@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatIcon,
    MatDividerModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  events: CampusEvent[] = [];
  companies: Company[] = [];
  sponsors:  Sponsor[] = [];

  displayedColumns = ['title','date','location','actions'];

  form!: FormGroup;
  editing = false;

  constructor(
    private api: ApiService,
    private fb: FormBuilder,
    private snack: MatSnackBar
  ) {
    this.form = this.fb.group({
      eventId:     [null],
      title:       ['', Validators.required],
      description: [''],
      date:        [null, Validators.required],
      location:    ['', Validators.required],
      companies:   [[], Validators.required],
      sponsors:    [[]]
    });
  }

  ngOnInit() {
    this.loadAll();
    this.api.getCompanies().subscribe(c => this.companies = c);
  }

  loadAll() {
    this.api.getAllEvents().subscribe((ev: CampusEvent[]) => this.events = ev);
  }

  startEdit(ev: CampusEvent) {
    this.editing = true;
    this.form.patchValue({
      eventId:     ev.eventId,
      title:       ev.title,
      description: ev.description,
      date:        new Date(ev.date),
      location:    ev.location,
      companies:   ev.companies.map(c => c.companyId),
      sponsors:    ev.sponsors.map(s => s.sponsorId)
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancel() {
    this.editing = false;
    this.form.reset();
  }

  save() {
    const v = this.form.value;
    const payload: Partial<CampusEvent> = {
      title:       v.title,
      description: v.description,
      date:        v.date.toISOString().split('T')[0],
      location:    v.location,
      companies:   v.companies.map((id: number) => ({ companyId: id })),
      sponsors:    v.sponsors.map((id: number) => ({ sponsorId: id })),
      admin:       { adminId: +localStorage.getItem('userId')! }
    };

      this.api.createEvent(payload).subscribe(() => {
        this.snack.open('Event created', 'Close',{ duration:3000 });
        this.cancel(); this.loadAll();
      });
    }

  delete(ev: CampusEvent) {
    if (!confirm(`Delete event “${ev.title}”?`)) return;
    this.api.deleteEvent(ev.eventId).subscribe(() => {
      this.snack.open('Deleted', 'Close',{ duration:2000 });
      this.loadAll();
    });
  }
}
