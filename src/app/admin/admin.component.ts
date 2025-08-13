import { Component, OnInit } from '@angular/core';

import { NavigationPanelComponent, Section } from '../shared/components/navigation-panel/navigation-panel.component';

@Component({
  selector: 'admin',
  imports: [NavigationPanelComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  sections: Section[] = [
    { type: 'item', label: 'Users', icon: 'group', route: './users' },
    { type: 'item', label: 'News', icon: 'newspaper', route: './news', disabled: true },
    { type: 'item', label: 'Changelog', icon: 'library_books', route: './changelog', disabled: true }
  ];

  ngOnInit(): void {}
}
