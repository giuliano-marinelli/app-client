import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';

import { NavigationPanelComponent, Section } from '../shared/components/navigation-panel/navigation-panel.component';

import { AuthService } from '../services/auth.service';

@Component({
  selector: 'settings',
  templateUrl: './settings.component.html',
  imports: [
    MatButtonModule,
    MatProgressSpinnerModule,
    NavigationPanelComponent,
    RouterLink
  ]
})
export class SettingsComponent {
  auth: AuthService = inject(AuthService);

  sections: Section[] = [
    { type: 'item', label: 'Profile', icon: 'person', route: './profile' },
    { type: 'item', label: 'Account', icon: 'settings', route: './account' },
    { type: 'item', label: 'Notifications', icon: 'notifications', route: './notifications', disabled: true },
    { type: 'divider', label: 'Access' },
    { type: 'item', label: 'Emails', icon: 'email', route: './emails' },
    { type: 'item', label: 'Passwords', icon: 'key', route: './security' },
    { type: 'item', label: 'Devices', icon: 'devices', route: './devices' }
  ];
}
