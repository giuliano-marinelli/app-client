import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { NgTemplateOutlet } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

export type Section =
  | {
      type: 'item';
      label: string;
      icon: string;
      route: string;
      disabled?: boolean;
    }
  | { type: 'divider'; label?: string };

@Component({
  selector: 'navigation-panel',
  templateUrl: './navigation-panel.component.html',
  imports: [
    MatExpansionModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatSidenavModule,
    NgTemplateOutlet,
    RouterLink,
    RouterLinkActive,
    RouterOutlet
  ]
})
export class NavigationPanelComponent implements OnInit {
  _breakpointObserver: BreakpointObserver = inject(BreakpointObserver);

  @Input() sections: Section[] = [];
  @Input() menuIcon = '';
  @Input() menuTitle = '';

  $isSmallScreen = false;

  ngOnInit() {
    this._breakpointObserver.observe([Breakpoints.XSmall]).subscribe((result) => {
      this.$isSmallScreen = result.matches;
    });
  }
}
