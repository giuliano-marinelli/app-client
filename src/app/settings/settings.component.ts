import { Component, OnInit } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';

import { NavigationPanelComponent, Section } from '../shared/components/navigation-panel/navigation-panel.component';

import { AuthService } from '../services/auth.service';

@Component({
  selector: 'settings',
  imports: [MatProgressSpinnerModule, NavigationPanelComponent, RouterLink],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  constructor(public auth: AuthService) {}

  sections: Section[] = [
    { type: 'item', label: 'Profile', icon: 'person', route: './profile' },
    { type: 'item', label: 'Account', icon: 'settings', route: './account' },
    { type: 'item', label: 'Notifications', icon: 'notifications', route: './notifications', disabled: true },
    { type: 'divider', label: 'Access' },
    { type: 'item', label: 'Emails', icon: 'email', route: './emails' },
    { type: 'item', label: 'Passwords', icon: 'key', route: './security' },
    { type: 'item', label: 'Devices', icon: 'devices', route: './devices' }
  ];

  ngOnInit(): void {}
}
