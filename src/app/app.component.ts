import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { NgTemplateOutlet } from '@angular/common';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { siFirefoxbrowser, siGooglechrome, siOpera, siSafari } from 'simple-icons';
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
export class AppComponent implements OnInit {
  auth: AuthService = inject(AuthService);
  router: Router = inject(Router);
  messages: MessagesService = inject(MessagesService);
  titleService: TitleService = inject(TitleService);
  themeService: ThemeService = inject(ThemeService);

  _iconRegistry: MatIconRegistry = inject(MatIconRegistry);
  _sanitizer: DomSanitizer = inject(DomSanitizer);
  _breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  _logout: Logout = inject(Logout);

  @ViewChild('drawer') drawer: any;

  title = 'App';

  isDevelopment = !environment.production;

  $isFullNav = false;
  $isLargeScreen = false;
  $isSmallScreen = false;

  navLinks = [
    { label: 'Home', icon: 'home', route: '/', exact: true },
    { label: 'Admin', icon: 'manage_accounts', route: '/admin', admin: true },
    { toBottom: true },
    { label: 'Settings', icon: 'settings', route: '/settings', auth: true },
    { label: 'Sign in', icon: 'account_circle', route: '/login', auth: false }
  ];

  ngOnInit() {
    this.registerBrandIcons();

    this.$isFullNav = localStorage.getItem('app-full-nav') === 'true';

    this._breakpointObserver.observe([Breakpoints.Large, Breakpoints.XLarge]).subscribe((result) => {
      this.$isLargeScreen = result.matches;
      if (this.$isLargeScreen) this.drawer?.close();
    });

    this._breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]).subscribe((result) => {
      this.$isSmallScreen = result.matches;
    });

    // Initialize theme
    this.themeService.init();

    // For change page title
    this.titleService.appTitle = this.title;
    this.titleService.initTitle();
  }

  registerBrandIcons() {
    this._iconRegistry.addSvgIconLiteral('chrome', this._sanitizer.bypassSecurityTrustHtml(siGooglechrome.svg));
    this._iconRegistry.addSvgIconLiteral('firefox', this._sanitizer.bypassSecurityTrustHtml(siFirefoxbrowser.svg));
    this._iconRegistry.addSvgIconLiteral('safari', this._sanitizer.bypassSecurityTrustHtml(siSafari.svg));
    this._iconRegistry.addSvgIconLiteral('opera', this._sanitizer.bypassSecurityTrustHtml(siOpera.svg));
  }

  toggleFullNav() {
    this.$isFullNav = !this.$isFullNav;
    localStorage.setItem('app-full-nav', this.$isFullNav.toString());
  }

  checkNavAccess(navLink: any) {
    if (this.auth.loading && (navLink.auth || navLink.admin)) return false;
    if (navLink.auth && !this.auth.user) return false;
    if (navLink.auth === false && this.auth.user) return false;
    if (navLink.admin && this.auth.user?.role !== 'admin') return false;
    if (navLink.admin === false && this.auth.user?.role === 'admin') return false;
    return true;
  }

  logout() {
    this._logout.fetch().subscribe({
      next: ({ data, errors }) => {
        if (errors) this.messages.error(errors, 'Logout failed. Please try again later.');
        else if (data?.logout) {
          this.auth.eraseToken();
          this.auth.setUser();
          this.messages.info('Goodbye! Hope to see you soon!');
        }
      }
    });
  }
}
