import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';

import { TranslocoModule, TranslocoService, translate } from '@jsverse/transloco';

import { NavigationPanelComponent, Section } from '../shared/components/navigation-panel/navigation-panel.component';

import { AuthService } from '../services/auth.service';

@Component({
  selector: 'settings',
  templateUrl: './settings.component.html',
  imports: [
    MatButtonModule,
    MatProgressSpinnerModule,
    NavigationPanelComponent,
    RouterLink,
    TranslocoModule
  ]
})
export class SettingsComponent implements OnInit {
  _auth: AuthService = inject(AuthService);
  _transloco: TranslocoService = inject(TranslocoService);

  sections: Section[] = [];

  ngOnInit() {
    this._transloco.selectTranslation().subscribe(() => {
      this.sections = [
        {
          type: 'item',
          label: translate('settings.nav.profile'),
          icon: 'person',
          route: './profile'
        },
        {
          type: 'item',
          label: translate('settings.nav.account'),
          icon: 'settings',
          route: './account'
        },
        {
          type: 'item',
          label: translate('settings.nav.notifications'),
          icon: 'notifications',
          route: './notifications',
          disabled: true
        },
        {
          type: 'divider',
          label: translate('settings.nav.access')
        },
        {
          type: 'item',
          label: translate('settings.nav.emails'),
          icon: 'email',
          route: './emails'
        },
        {
          type: 'item',
          label: translate('settings.nav.security'),
          icon: 'key',
          route: './security'
        },
        {
          type: 'item',
          label: translate('settings.nav.devices'),
          icon: 'devices',
          route: './devices'
        }
      ];
    });
  }
}
