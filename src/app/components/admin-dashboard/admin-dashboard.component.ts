import { Component, OnInit }        from '@angular/core';
import { CommonModule }             from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
  FormControl // Import FormControl
} from '@angular/forms';
import { MatCardModule }            from '@angular/material/card';
import { MatTableModule }           from '@angular/material/table';
import { MatFormFieldModule }       from '@angular/material/form-field';
import { MatInputModule }           from '@angular/material/input';
import { MatButtonModule }          from '@angular/material/button';
import { MatDatepickerModule }      from '@angular/material/datepicker';
import { MatNativeDateModule, MatOption } from '@angular/material/core';
import { MatSelectModule }          from '@angular/material/select';
import { MatChipsModule, MatChipInputEvent } from '@angular/material/chips'; // Import MatChipInputEvent
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete'; // Import MatAutocompleteSelectedEvent
import { ApiService }               from '../../services/api.service';
import { MatSnackBar }              from '@angular/material/snack-bar';
import { Sponsor, CampusEvent }  from '../../models/campus-event.model';
import { MatIcon } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { COMMA, ENTER } from '@angular/cdk/keycodes'; // For chip input separators
import { ElementRef, ViewChild } from '@angular/core'; // For accessing input element
import { Observable, map, startWith } from 'rxjs'; // For autocomplete filtering
import { Company } from '../../models/company.model';
import { NgChartsModule }            from 'ng2-charts';





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
    MatChipsModule, // Add Chips module here
    MatAutocompleteModule, // Add Autocomplete module here
    MatIcon,
    MatDividerModule,
    NgChartsModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  events: CampusEvent[] = [];
  allCompanies: Company[] = []; // Store all fetched companies
  allSponsors: Sponsor[] = []; // Store all fetched sponsors

  // Chip input configuration
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  selectedCompanies: (Company | { companyName: string })[] = []; // Can hold existing Company objects or new {name: string} objects
  selectedSponsors: (Sponsor | { name: string })[] = [];

  // Autocomplete configuration
  companyCtrl = new FormControl(''); // Separate form control for the autocomplete input
  sponsorCtrl = new FormControl('');
  filteredCompanies!: Observable<(Company | { companyName: string })[]>; // Observable for filtered company suggestions
  filteredSponsors!: Observable<(Sponsor | { name: string })[]>;

  @ViewChild('companyInput') companyInput!: ElementRef<HTMLInputElement>;
  @ViewChild('sponsorInput') sponsorInput!: ElementRef<HTMLInputElement>;


  displayedColumns = ['title', 'date', 'location', 'actions'];

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
      // Remove companies and sponsors from main form group, handled by chip inputs now
      // companies:   [[], Validators.required],
      // sponsors:    [[]]
    });

    this._setupAutocomplete();
  }

  ngOnInit() {
    this.loadAll();
    this.api.getCompanies().subscribe(c => {
      this.allCompanies = c;
      this.companyCtrl.setValue(null); // Trigger autocomplete update
    });
    // TODO: Load sponsors similarly
    // this.api.getSponsors().subscribe(s => {
    //   this.allSponsors = s;
    //   this.sponsorCtrl.setValue(null); // Trigger autocomplete update
    // });
  }

  private _setupAutocomplete() {
    this.filteredCompanies = this.companyCtrl.valueChanges.pipe(
      startWith(null),
      map((inputVal: string | Company | null) => {
        const name = typeof inputVal === 'string' ? inputVal : inputVal?.companyName;
        return name ? this._filterCompanies(name) : this.allCompanies.slice();
      }),
    );

    this.filteredSponsors = this.sponsorCtrl.valueChanges.pipe(
      startWith(null),
      map((inputVal: string | Sponsor | null) => {
        const name = typeof inputVal === 'string' ? inputVal : inputVal?.name;
        return name ? this._filterSponsors(name) : this.allSponsors.slice();
      }),
    );
  }

  private _filterCompanies(value: string): Company[] {
    const filterValue = value.toLowerCase();
    return this.allCompanies.filter(company =>
      company.companyName.toLowerCase().includes(filterValue) &&
      !this.selectedCompanies.some(sel => 'companyId' in sel && sel.companyId === company.companyId) // Exclude already selected
    );
  }

   private _filterSponsors(value: string): Sponsor[] {
    const filterValue = value.toLowerCase();
    return this.allSponsors.filter(sponsor =>
      sponsor.name.toLowerCase().includes(filterValue) &&
      !this.selectedSponsors.some(sel => 'sponsorId' in sel && sel.sponsorId === sponsor.sponsorId) // Exclude already selected
    );
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
      location:    ev.location
      // companies and sponsors are handled separately below
    });
    // Populate chip lists
    this.selectedCompanies = [...ev.companies];
    this.selectedSponsors = [...ev.sponsors];
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancel() {
    this.editing = false;
    this.form.reset();
    this.selectedCompanies = []; // Clear chips
    this.selectedSponsors = [];
    this.companyCtrl.setValue(''); // Clear autocomplete inputs
    this.sponsorCtrl.setValue('');
  }

  save() {
    const v = this.form.value;
    // Define payload type more accurately based on what backend expects (CompanyInput/SponsorInput structure)
    const payload: {
      eventId?: number;
      title: string;
      description: string;
      date: string;
      location: string;
      companies: { companyId?: number; name?: string }[];
      sponsors: { sponsorId?: number; name?: string }[];
      admin: { adminId: number };
    } = {
      title:       v.title,
      description: v.description,
      date:        v.date.toISOString().split('T')[0],
      location:    v.location,
      // Map selected chips to the expected backend format (CompanyInput/SponsorInput)
      companies:   this.selectedCompanies.map(c => 'companyId' in c ? { companyId: c.companyId } : { name: c.companyName }),
      sponsors:    this.selectedSponsors.map(s => 'sponsorId' in s ? { sponsorId: s.sponsorId } : { name: s.name }),
      admin:       { adminId: +localStorage.getItem('userId')! } // Assuming adminId is stored like this
    };

    if (this.editing && v.eventId) {
       // Update existing event
       payload.eventId = v.eventId; // Add eventId for update
       this.api.updateEvent(payload as CampusEvent).subscribe(() => { // Cast to full CampusEvent might be needed depending on API service method
         this.snack.open('Event updated', 'Close', { duration: 3000 });
         this.cancel(); this.loadAll();
       });
    } else {
      // Create new event
      this.api.createEvent(payload).subscribe(() => {
        this.snack.open('Event created', 'Close', { duration: 3000 });
        this.cancel(); this.loadAll();
      });
    }
  }

  // --- Chip Input Methods ---

  addCompany(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value && !this.selectedCompanies.some(c => c.companyName.toLowerCase === value.toLowerCase)) {
       // Check if it matches an existing company not already selected
       const existing = this.allCompanies.find(c => c.companyName.toLowerCase() === value.toLowerCase() && !this.selectedCompanies.some(sel => 'companyId' in sel && sel.companyId === c.companyId));
       if (existing) {
         this.selectedCompanies.push(existing);
       } else {
         // Add as a new company name object
         this.selectedCompanies.push({ companyName: value });
       }
    }
    // Clear the input value
    event.chipInput!.clear();
    this.companyCtrl.setValue(null); // Reset autocomplete
  }

  removeCompany(company: Company | { companyName: string }): void {
    const index = this.selectedCompanies.indexOf(company);
    if (index >= 0) {
      this.selectedCompanies.splice(index, 1);
      this.companyCtrl.setValue(null); // Trigger autocomplete update
    }
  }

  selectedCompany(event: MatAutocompleteSelectedEvent): void {
    const selectedCompany = event.option.value as Company;
     if (!this.selectedCompanies.some(c => 'companyId' in c && c.companyId === selectedCompany.companyId)) {
        this.selectedCompanies.push(selectedCompany);
     }
    this.companyInput.nativeElement.value = '';
    this.companyCtrl.setValue(null);
  }

  // --- Sponsor Chip Methods (similar to Company) ---

  addSponsor(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
     if (value && !this.selectedSponsors.some(s => s.name === value)) {
       const existing = this.allSponsors.find(s => s.name.toLowerCase() === value.toLowerCase() && !this.selectedSponsors.some(sel => 'sponsorId' in sel && sel.sponsorId === s.sponsorId));
       if (existing) {
         this.selectedSponsors.push(existing);
       } else {
         this.selectedSponsors.push({ name: value });
       }
     }
    event.chipInput!.clear();
    this.sponsorCtrl.setValue(null);
  }

  removeSponsor(sponsor: Sponsor | { name: string }): void {
    const index = this.selectedSponsors.indexOf(sponsor);
    if (index >= 0) {
      this.selectedSponsors.splice(index, 1);
      this.sponsorCtrl.setValue(null);
    }
  }

  selectedSponsor(event: MatAutocompleteSelectedEvent): void {
     const selectedSponsor = event.option.value as Sponsor;
     if (!this.selectedSponsors.some(s => 'sponsorId' in s && s.sponsorId === selectedSponsor.sponsorId)) {
        this.selectedSponsors.push(selectedSponsor);
     }
    this.sponsorInput.nativeElement.value = '';
    this.sponsorCtrl.setValue(null);
  }


  delete(ev: CampusEvent) {
    if (!confirm(`Delete event “${ev.title}”?`)) return;
    this.api.deleteEvent(ev.eventId).subscribe(() => {
      this.snack.open('Deleted', 'Close',{ duration:2000 });
      this.loadAll();
    });
  }
}
