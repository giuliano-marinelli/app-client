import { Component } from '@angular/core';

import { NavigationPanelComponent, Section } from '../shared/components/navigation-panel/navigation-panel.component';

@Component({
  selector: 'admin',
  templateUrl: './admin.component.html',
  imports: [NavigationPanelComponent]
})
export class AdminComponent {
  sections: Section[] = [
    { type: 'item', label: 'Users', icon: 'group', route: './users' },
    { type: 'item', label: 'News', icon: 'newspaper', route: './news', disabled: true },
    { type: 'item', label: 'Changelog', icon: 'library_books', route: './changelog', disabled: true }
  ];
}
