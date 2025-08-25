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

import { TranslocoModule, TranslocoService, translate } from '@jsverse/transloco';

import { environment } from '../environments/environment';
import { siFirefoxbrowser, siGooglechrome, siOpera, siSafari } from 'simple-icons';

import { Logout } from './shared/entities/user.entity';

import { AuthService } from './services/auth.service';
import { LanguageService } from './services/language.service';
import { MessagesService } from './services/messages.service';
import { ThemeService } from './services/theme.service';
import { TitleService } from './services/title.service';

import { VarDirective } from './shared/directives/var.directive';

import { MatMultiPageMenuModule } from './shared/components/material/multi-page-menu/multi-page-menu-module';

export type NavLink =
  | {
      type: 'item';
      label: string;
      icon: string;
      route: string;
      exact?: boolean;
      auth?: boolean;
      admin?: boolean;
    }
  | { type: 'toBottom' };

@Component({
  selector: 'root',
  templateUrl: './app.component.html',
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
    TranslocoModule,
    VarDirective
  ]
})
export class AppComponent implements OnInit {
  _auth: AuthService = inject(AuthService);
  _router: Router = inject(Router);
  _messages: MessagesService = inject(MessagesService);
  _lang: LanguageService = inject(LanguageService);
  _title: TitleService = inject(TitleService);
  _theme: ThemeService = inject(ThemeService);
  _transloco: TranslocoService = inject(TranslocoService);
  _iconRegistry: MatIconRegistry = inject(MatIconRegistry);
  _sanitizer: DomSanitizer = inject(DomSanitizer);
  _breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  _logout: Logout = inject(Logout);

  @ViewChild('drawer') drawer: any;

  isDevelopment = !environment.production;

  $isFullNav = false;
  $isLargeScreen = false;
  $isSmallScreen = false;

  navLinks: NavLink[] = [];

  ngOnInit() {
    this.registerIcons();

    this.$isFullNav = localStorage.getItem('app-full-nav') === 'true';

    this._breakpointObserver
      .observe([
        Breakpoints.Large,
        Breakpoints.XLarge
      ])
      .subscribe((result) => {
        this.$isLargeScreen = result.matches;
        if (this.$isLargeScreen) this.drawer?.close();
      });

    this._breakpointObserver
      .observe([
        Breakpoints.XSmall,
        Breakpoints.Small
      ])
      .subscribe((result) => {
        this.$isSmallScreen = result.matches;
      });

    // Initialize language
    this._lang.init();

    // Initialize theme
    this._theme.init();

    // For change page title
    this._title.initTitle();

    // Initialize navigation links
    this._transloco.selectTranslation().subscribe(() => {
      this.navLinks = [
        {
          type: 'item',
          label: translate('nav.home'),
          icon: 'home',
          route: '/',
          exact: true
        },
        {
          type: 'item',
          label: translate('nav.admin'),
          icon: 'manage_accounts',
          route: '/admin',
          admin: true
        },
        { type: 'toBottom' },
        {
          type: 'item',
          label: translate('nav.settings'),
          icon: 'settings',
          route: '/settings',
          auth: true
        },
        {
          type: 'item',
          label: translate('nav.login'),
          icon: 'account_circle',
          route: '/login',
          auth: false
        }
      ];
    });
  }

  trackByNavLink(navLink: NavLink): string {
    return `${navLink.type}${navLink.type === 'item' ? '::' + navLink.route : ''}`;
  }

  registerIcons() {
    // app logo
    this._iconRegistry.addSvgIcon(
      'app-logo',
      this._sanitizer.bypassSecurityTrustResourceUrl('../assets/images/logo.svg')
    );
    // brand logos
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
    if (this._auth.loading && (navLink.auth || navLink.admin)) return false;
    if (navLink.auth && !this._auth.user) return false;
    if (navLink.auth === false && this._auth.user) return false;
    if (navLink.admin && this._auth.user?.role !== 'admin') return false;
    if (navLink.admin === false && this._auth.user?.role === 'admin') return false;
    return true;
  }

  logout() {
    this._logout.fetch().subscribe({
      next: ({ data, errors }) => {
        if (errors) this._messages.error(errors, translate('messages.logoutError'));
        else if (data?.logout) {
          this._auth.eraseToken();
          this._auth.setUser();
          this._messages.info(translate('messages.logoutSuccess'));
        }
      }
    });
  }
}
