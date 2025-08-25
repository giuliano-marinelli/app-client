import { Component, OnInit, inject } from '@angular/core';

import { TranslocoService, translate } from '@jsverse/transloco';

import { NavigationPanelComponent, Section } from '../shared/components/navigation-panel/navigation-panel.component';

@Component({
  selector: 'admin',
  templateUrl: './admin.component.html',
  imports: [NavigationPanelComponent]
})
export class AdminComponent implements OnInit {
  _transloco: TranslocoService = inject(TranslocoService);

  sections: Section[] = [];

  ngOnInit() {
    this._transloco.selectTranslation().subscribe(() => {
      this.sections = [
        {
          type: 'item',
          label: translate('admin.nav.users'),
          icon: 'group',
          route: './users'
        },
        {
          type: 'item',
          label: translate('admin.nav.news'),
          icon: 'newspaper',
          route: './news',
          disabled: true
        },
        {
          type: 'item',
          label: translate('admin.nav.changelog'),
          icon: 'library_books',
          route: './changelog',
          disabled: true
        }
      ];
    });
  }
}
