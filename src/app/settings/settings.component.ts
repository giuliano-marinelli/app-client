import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../services/auth.service';

@Component({
  selector: 'settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  imports: [
    MatExpansionModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatSidenavModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet
  ]
})
export class SettingsComponent implements OnInit {
  $isSmallScreen: boolean = false;

  constructor(
    public auth: AuthService,
    public router: Router,
    private _breakpointObserver: BreakpointObserver
  ) {
    this._breakpointObserver.observe([Breakpoints.XSmall]).subscribe((result) => {
      this.$isSmallScreen = result.matches;
    });
  }

  sections = [
    { label: 'Profile', icon: 'person', route: './profile' },
    { label: 'Account', icon: 'settings', route: './account' },
    { label: 'Notifications', icon: 'notifications', route: './notifications' },
    { label: 'Emails', icon: 'email', route: './emails' },
    { label: 'Passwords', icon: 'key', route: './security' },
    { label: 'Devices', icon: 'devices', route: './devices' }
  ];

  get currentSection() {
    return this.sections.find((section) => section.route === this.router.url);
  }

  ngOnInit(): void {}
}
