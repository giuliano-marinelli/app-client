import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { NgTemplateOutlet } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { environment } from '../environments/environment';

import { Logout } from './shared/entities/user.entity';

import { AuthService } from './services/auth.service';
import { MessagesService } from './services/messages.service';
import { ThemeService } from './services/theme.service';
import { TitleService } from './services/title.service';

import { VarDirective } from './shared/directives/var.directive';

import { MatMultiPageMenuModule } from './shared/components/material/multi-page-menu/multi-page-menu-module';

@Component({
  selector: 'root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatMultiPageMenuModule,
    MatProgressSpinnerModule,
    MatSidenavModule,
    MatToolbarModule,
    NgTemplateOutlet,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    VarDirective
  ]
})
export class AppComponent {
  @ViewChild('drawer') drawer: any;

  title = 'App';

  isDevelopment: boolean = !environment.production;

  $isFullNav: boolean = false;
  $isLargeScreen: boolean = false;
  $isSmallScreen: boolean = false;

  navLinks = [
    { label: 'Home', icon: 'home', route: '/', exact: true },
    { label: 'Dashboard', icon: 'dashboard', route: '/asd1' },
    { label: 'Reports', icon: 'bar_chart', route: '/asd2' },
    { label: 'Settings', icon: 'settings', route: '/settings' }
  ];

  constructor(
    public auth: AuthService,
    public router: Router,
    public messages: MessagesService,
    public titleService: TitleService,
    public themeService: ThemeService,
    private _breakpointObserver: BreakpointObserver,
    private _logout: Logout
  ) {
    this.$isFullNav = localStorage.getItem('app-full-nav') === 'true';

    this._breakpointObserver.observe([Breakpoints.Large, Breakpoints.XLarge]).subscribe((result) => {
      this.$isLargeScreen = result.matches;
      if (this.$isLargeScreen) this.drawer?.close();
    });

    this._breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]).subscribe((result) => {
      this.$isSmallScreen = result.matches;
    });
  }

  ngOnInit() {
    // Initialize theme
    this.themeService.init();

    // For change page title
    this.titleService.appTitle = this.title;
    this.titleService.initTitle();
  }

  toggleFullNav() {
    this.$isFullNav = !this.$isFullNav;
    localStorage.setItem('app-full-nav', this.$isFullNav.toString());
  }

  logout() {
    this._logout.fetch().subscribe({
      next: ({ data, errors }) => {
        if (errors) this.messages.error(errors, 'Logout failed. Please try again.');
        else if (data?.logout) {
          this.auth.eraseToken();
          this.auth.setUser();
          this.messages.info('Goodbye! Hope to see you soon!');
        }
      }
    });
  }
}
