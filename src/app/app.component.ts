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
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { environment } from '../environments/environment';
import { filter, map } from 'rxjs';

import { Logout } from './shared/entities/user.entity';

import { AuthService } from './services/auth.service';
import { MessagesService } from './services/messages.service';
import { ThemeService } from './services/theme.service';

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

  isDevelopment: boolean = !environment.production;

  $isFullNav: boolean = false;
  $isLargeScreen: boolean = false;
  $isSmallScreen: boolean = false;

  navLinks = [
    { label: 'Home', icon: 'home', route: '/' },
    { label: 'Dashboard', icon: 'dashboard', route: '/asd1' },
    { label: 'Reports', icon: 'bar_chart', route: '/asd2' },
    { label: 'Settings', icon: 'settings', route: '/asd3' }
  ];

  constructor(
    public auth: AuthService,
    public router: Router,
    public messages: MessagesService,
    public titleService: Title,
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
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => {
          let route: ActivatedRoute = this.router.routerState.root;
          let routeTitle = '';
          while (route!.firstChild) {
            route = route.firstChild;
          }
          if (route.snapshot.data['title'] != undefined) {
            routeTitle = route!.snapshot.data['title'];
          }
          return routeTitle;
        })
      )
      .subscribe((title: string) => {
        if (title) {
          this.titleService.setTitle(`${title} · App`);
        } else {
          this.titleService.setTitle(`App`);
        }
      });
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
