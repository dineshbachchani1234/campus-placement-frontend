import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule, MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Observable, map, startWith, forkJoin } from 'rxjs';

import { ApiService } from '../../services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Sponsor, CampusEvent } from '../../models/campus-event.model';
import { Company } from '../../models/company.model';
import { ChartDataset, ChartOptions, ChartType } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';

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
    MatChipsModule,
    MatAutocompleteModule,
    MatIconModule,
    MatDividerModule,
    NgChartsModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  events: CampusEvent[] = [];
  allCompanies: Company[] = [];
  allSponsors: Sponsor[] = [];

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  selectedCompanies: (Company | { companyName: string })[] = [];
  selectedSponsors: (Sponsor | { name: string })[] = [];

  companyCtrl = new FormControl('');
  sponsorCtrl = new FormControl('');
  filteredCompanies!: Observable<(Company | { companyName: string })[]>;
  filteredSponsors!: Observable<(Sponsor | { name: string })[]>;

  @ViewChild('companyInput') companyInput!: ElementRef<HTMLInputElement>;
  @ViewChild('sponsorInput') sponsorInput!: ElementRef<HTMLInputElement>;

  displayedColumns = ['title', 'date', 'location', 'actions'];

  form!: FormGroup;
  editing = false;

  public barChartOptions: ChartOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' } }
  };
  public barChartLabels: string[] = [];
  public barChartData: ChartDataset<'bar', number[]>[] = [
    { data: [], label: 'Placed Students' }
  ];
  public barChartType: ChartType = 'bar';

  public pieChartLabels: string[] = [];
  public pieChartDatasets: ChartDataset<'pie', number[]>[] = [
    { data: [], label: 'Placed Students' }
  ];
  public pieChartType: ChartType = 'pie';
  public pieChartOptions: ChartOptions = {
    responsive: true,
    plugins: { legend: { position: 'right' } }
  };

  constructor(
    private api: ApiService,
    private fb: FormBuilder,
    private snack: MatSnackBar
  ) {
    this.form = this.fb.group({
      eventId: [null],
      title: ['', Validators.required],
      description: [''],
      date: [null, Validators.required],
      location: ['', Validators.required]
    });
    this._setupAutocomplete();
  }

  ngOnInit() {
    this.loadAllEvents();
    this.api.getCompanies().subscribe(c => {
      this.allCompanies = c;
      this.companyCtrl.setValue(null);
      this.loadPlacementReports();
    });
  }

  private _setupAutocomplete() {
    this.filteredCompanies = this.companyCtrl.valueChanges.pipe(
      startWith(null),
      map((input: string | Company | null) => {
        const name = typeof input === 'string' ? input : input?.companyName;
        return name ? this._filterCompanies(name) : this.allCompanies.slice();
      })
    );
    this.filteredSponsors = this.sponsorCtrl.valueChanges.pipe(
      startWith(null),
      map((input: string | Sponsor | null) => {
        const name = typeof input === 'string' ? input : input?.name;
        return name ? this._filterSponsors(name) : this.allSponsors.slice();
      })
    );
  }

  private _filterCompanies(value: string): Company[] {
    const filter = value.toLowerCase();
    return this.allCompanies.filter(c =>
      c.companyName.toLowerCase().includes(filter) &&
      !this.selectedCompanies.some(sel => 'companyId' in sel && sel.companyId === c.companyId)
    );
  }

  private _filterSponsors(value: string): Sponsor[] {
    const filter = value.toLowerCase();
    return this.allSponsors.filter(s =>
      s.name.toLowerCase().includes(filter) &&
      !this.selectedSponsors.some(sel => 'sponsorId' in sel && sel.sponsorId === s.sponsorId)
    );
  }

  private loadAllEvents() {
    this.api.getAllEvents().subscribe(ev => this.events = ev);
  }

  startEdit(ev: CampusEvent) {
    this.editing = true;
    this.form.patchValue({
      eventId: ev.eventId,
      title: ev.title,
      description: ev.description,
      date: new Date(ev.date),
      location: ev.location
    });
    this.selectedCompanies = [...ev.companies];
    this.selectedSponsors = [...ev.sponsors];
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancel() {
    this.editing = false;
    this.form.reset();
    this.selectedCompanies = [];
    this.selectedSponsors = [];
    this.companyInput.nativeElement.value = '';
    this.sponsorInput.nativeElement.value = '';
    this.companyCtrl.setValue(null);
    this.sponsorCtrl.setValue(null);
  }

  save() {
    const v = this.form.value;
    const payload: any = {
      title: v.title,
      description: v.description,
      date: v.date.toISOString().split('T')[0],
      location: v.location,
      companies: this.selectedCompanies.map(c => 'companyId' in c ? { companyId: c.companyId } : { name: c.companyName }),
      sponsors: this.selectedSponsors.map(s => 'sponsorId' in s ? { sponsorId: s.sponsorId } : { name: s.name }),
      admin: { adminId: +localStorage.getItem('userId')! }
    };
    if (this.editing && v.eventId) {
      payload.eventId = v.eventId;
      this.api.updateEvent(payload).subscribe(() => {
        this.snack.open('Event updated', 'Close', { duration: 3000 });
        this.cancel(); this.loadAllEvents();
      });
    } else {
      this.api.createEvent(payload).subscribe(() => {
        this.snack.open('Event created', 'Close', { duration: 3000 });
        this.cancel(); this.loadAllEvents();
      });
    }
  }

  delete(ev: CampusEvent) {
    if (!confirm(`Delete event "${ev.title}"?`)) return;
    this.api.deleteEvent(ev.eventId).subscribe(() => {
      this.snack.open('Deleted', 'Close', { duration: 2000 });
      this.loadAllEvents();
    });
  }

  private loadPlacementReports(): void {
    forkJoin({
      reports: this.api.getPlacementReports(),
      colleges: this.api.getColleges()
    }).subscribe(({ reports, colleges }) => {
  
      // --- 1) BAR CHART: sum placedStudents per year ---
      const byYear = new Map<number, number>();
      for (let r of reports) {
        const year = r.id?.year;
        if (year == null) continue;                // skip if missing
        byYear.set(year, (byYear.get(year) || 0) + r.placedStudents);
      }
  
      // sort the years numerically
      const years = Array.from(byYear.keys()).sort((a, b) => a - b);
      this.barChartLabels = years.map(y => y.toString());
      this.barChartData[0].data = years.map(y => byYear.get(y)!);
  
      // --- 2) PIE CHART: for the latest year, split by college ---
      const latestYear = years.length ? years[years.length - 1] : null;
      if (latestYear != null) {
        const forLatest = reports.filter(r => r.id.year === latestYear);
  
        const byCollege = new Map<number, number>();
        forLatest.forEach(r => {
          const cid = r.id.collegeID;
          byCollege.set(cid, (byCollege.get(cid) || 0) + r.placedStudents);
        });
  
        // build label/data arrays
        const pieLabels: string[] = [];
        const pieData: number[] = [];
        byCollege.forEach((placed, cid) => {
          const col = colleges.find(c => c.collegeId === cid);
          pieLabels.push(col?.name || `ID ${cid}`);
          pieData.push(placed);
        });
  
        this.pieChartLabels = pieLabels;
        this.pieChartDatasets[0].data = pieData;
      }
    });
  }
}
