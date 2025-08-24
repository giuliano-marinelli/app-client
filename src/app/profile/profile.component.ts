import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { NgTemplateOutlet } from '@angular/common';
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, effect, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { MomentModule } from 'ngx-moment';

import { VerifiedMarkComponent } from '../shared/components/verified-mark/verified-mark.component';

import { AuthService } from '../services/auth.service';
import { ProfileService } from '../services/profile.service';
import { TitleService } from '../services/title.service';

@Component({
  selector: 'profile',
  templateUrl: './profile.component.html',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MomentModule,
    NgTemplateOutlet,
    RouterLink,
    VerifiedMarkComponent
  ]
})
export class ProfileComponent implements OnInit, OnDestroy {
  _auth: AuthService = inject(AuthService);
  _router: Router = inject(Router);
  _route: ActivatedRoute = inject(ActivatedRoute);
  _title: TitleService = inject(TitleService);
  _profile: ProfileService = inject(ProfileService);
  _dialog: MatDialog = inject(MatDialog);
  _breakpointObserver: BreakpointObserver = inject(BreakpointObserver);

  @ViewChild('info') info!: TemplateRef<any>;

  //router params
  username!: string;

  $isSmallScreen = false;

  constructor() {
    effect(() => {
      const user = this._profile.user();
      if (user) {
        if (user.username) this._title.setParam('username', user.username);
        if (user.profile?.name) this._title.setParam('profilename', user.profile.name);
      }
    });
  }

  async ngOnInit(): Promise<void> {
    this._breakpointObserver.observe([Breakpoints.XSmall]).subscribe((result) => {
      this.$isSmallScreen = result.matches;
    });

    this._route.params.subscribe(async (params) => {
      this.username = params['username'];

      if (!this.username) this._router.navigate(['/']);
      try {
        await this._profile.fetchUser(this.username);
      } catch {
        this._router.navigate(['not-found']);
      }
    });
  }

  ngOnDestroy(): void {
    this._profile.reset();
  }
}
