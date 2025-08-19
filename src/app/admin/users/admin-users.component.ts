import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, HostListener, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';

import { FindUsers, User } from '../../shared/entities/user.entity';
import { Global } from '../../shared/global/global';
import { NgxMasonryModule } from 'ngx-masonry';
import { Observable } from 'rxjs';

import { SearchComponent } from '../../shared/components/search/search.component';
import { UserCardComponent } from '../../shared/components/user/card/user-card.component';

import { AuthService } from '../../services/auth.service';
import { MessagesService } from '../../services/messages.service';

import { FilterPipe } from '../../shared/pipes/filter.pipe';

@Component({
  selector: 'admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss'],
  imports: [
    MatButtonModule,
    MatButtonToggleModule,
    MatDividerModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    NgxMasonryModule,
    UserCardComponent
  ]
})
export class AdminUsersComponent implements OnInit {
  filter: any = Global.filter;

  usersLoading: boolean = true;
  submitLoading: string[] = [];

  users?: User[];
  usersPage?: number;
  usersPageSize?: number;
  usersCount: number = 0;
  usersSearch: any;

  usersListView: 'columns' | 'rows' = 'columns';

  $isSmallScreen: boolean = false;

  constructor(
    public auth: AuthService,
    public router: Router,
    public route: ActivatedRoute,
    public messages: MessagesService,
    private _breakpointObserver: BreakpointObserver,
    private _findUsers: FindUsers
  ) {
    this._breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]).subscribe((result) => {
      this.$isSmallScreen = result.matches;
    });
  }

  @HostListener('window:beforeunload', ['$event'])
  canDeactivate(): Observable<boolean> | boolean {
    return !this.hasChanges();
  }

  hasChanges(): boolean {
    return false;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (!params['page'] || !params['pageSize'] || params['page'] != this.usersPage || params['pageSize'] != this.usersPageSize) {
        this.usersPage = +params['page'] || 0; // default page to 0
        this.usersPageSize = +params['pageSize'] || 10; // default pageSize to 10
        this.getUsers();
      }
      if (params['pageView']) this.usersListView = params['pageView'];
    });
  }

  trackByUser(user: User): any {
    return user;
  }

  usersPageOrViewChange(pageEvent?: PageEvent, usersListView?: 'columns' | 'rows'): void {
    // set navigation for the page and page size from the event
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: pageEvent?.pageIndex ?? this.usersPage,
        pageSize: pageEvent?.pageSize ?? this.usersPageSize,
        pageView: usersListView || this.usersListView
      },
      queryParamsHandling: 'merge' // merge with existing query params
    });
  }

  getUsers(): void {
    this.usersLoading = true;
    this._findUsers({ relations: { sessions: { device: true }, emails: true } })
      .fetch({
        ...this.usersSearch,
        pagination: {
          page: this.usersPage!,
          count: this.usersPageSize!
        }
      })
      .subscribe({
        next: ({ data, errors }: any) => {
          if (errors) {
            this.messages.error(errors, 'Could not fetch users. Please try again later.');
          }
          if (data?.users) {
            const users = data?.users;
            this.users = users?.set;
            this.usersCount = users?.count;
          }
        }
      })
      .add(() => {
        this.usersLoading = false;
      });
  }
}
