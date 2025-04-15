import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import {MatToolbarModule} from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [MatButtonModule, RouterOutlet, MatToolbarModule, CommonModule],
})
export class AppComponent {
  constructor(public authService: AuthService) {}
}
