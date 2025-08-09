import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { NgTemplateOutlet } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild, effect, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
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
  styleUrls: ['./profile.component.scss'],
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MomentModule,
    NgTemplateOutlet,
    RouterLink,
    VerifiedMarkComponent
  ]
})
export class ProfileComponent implements OnInit {
  @ViewChild('info') info!: TemplateRef<any>;

  //router params
  username!: string;

  $isSmallScreen: boolean = false;
  $isLargeScreen: boolean = false;

  constructor(
    public auth: AuthService,
    public router: Router,
    public route: ActivatedRoute,
    public titleService: TitleService,
    public profile: ProfileService,
    public dialog: MatDialog,
    private _breakpointObserver: BreakpointObserver
  ) {
    this._breakpointObserver.observe([Breakpoints.XSmall]).subscribe((result) => {
      this.$isSmallScreen = result.matches;
    });
    this._breakpointObserver.observe([Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge]).subscribe((result) => {
      this.$isLargeScreen = result.matches;
    });

    effect(() => {
      const user = this.profile.user();
      if (user) {
        if (user.username) this.titleService.setParam('username', user.username);
        if (user.profile?.name) this.titleService.setParam('profilename', user.profile.name);
      }
    });
  }

  async ngOnInit(): Promise<void> {
    this.route.params.subscribe(async (params) => {
      this.username = params['username'];

      if (!this.username) this.router.navigate(['/']);
      try {
        await this.profile.fetchUser(this.username);
      } catch (error) {
        this.router.navigate(['not-found']);
      }
    });
  }

  ngOnDestroy(): void {
    this.profile.reset();
  }
}
