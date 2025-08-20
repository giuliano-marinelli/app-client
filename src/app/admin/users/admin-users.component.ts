import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, HostListener, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';

import { ApolloQueryResult } from '@apollo/client';

import { FindUsers, User } from '../../shared/entities/user.entity';
import { Attribute, Search, SearchParams } from '../../shared/global/search';
import { NgxMasonryModule } from 'ngx-masonry';
import { Observable } from 'rxjs';

import { SearchComponent } from '../../shared/components/search/search.component';
import { UserCardComponent } from '../../shared/components/user/card/user-card.component';

import { AuthService } from '../../services/auth.service';
import { MessagesService } from '../../services/messages.service';

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
    SearchComponent,
    UserCardComponent
  ]
})
export class AdminUsersComponent implements OnInit {
  auth: AuthService = inject(AuthService);
  router: Router = inject(Router);
  route: ActivatedRoute = inject(ActivatedRoute);
  messages: MessagesService = inject(MessagesService);
  _breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  _findUsers: FindUsers = inject(FindUsers);

  usersLoading = true;
  submitLoading: string[] = [];

  users?: User[];
  usersAttributes: Attribute[] = [
    { name: 'username', title: 'Username', type: 'string', simple: true },
    { name: 'role', title: 'Role', type: ['user', 'admin'] },
    { name: 'createdAt', title: 'Created at', type: 'Date' },
    { name: 'emails.address', title: 'Email', type: 'string', simple: true },
    { name: 'primaryEmail.verified', title: 'Verified', type: 'boolean' },
    { name: 'profile.name', category: 'Profile', title: 'Name', type: 'string', color: 'secondary', simple: true },
    { name: 'profile.bio', category: 'Profile', title: 'Bio', type: 'string', color: 'secondary', simple: true },
    { name: 'profile.url', category: 'Profile', title: 'URL', type: 'string', color: 'secondary', simple: true },
    { name: 'profile.location', category: 'Profile', title: 'Location', type: 'string', color: 'secondary', simple: true },
    { name: 'profile.publicEmail.address', category: 'Profile', title: 'Public Email', type: 'string', color: 'secondary', simple: true }
  ];
  usersSearchParams: SearchParams = Search.getDefaultSearchParams();
  usersCount = 0;

  $isSmallScreen = false;

  @HostListener('window:beforeunload', ['$event'])
  canDeactivate(): Observable<boolean> | boolean {
    return !this.hasChanges();
  }

  hasChanges(): boolean {
    return false;
  }

  ngOnInit(): void {
    this._breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]).subscribe((result) => {
      this.$isSmallScreen = result.matches;
    });

    // restore search params and if there are changes, fetch users
    this.route.queryParams.subscribe((params) => {
      if (Search.restoreSearchParams(params, this.usersSearchParams, this.router)) this.getUsers();
    });
  }

  trackByUser(user: User): User {
    return user;
  }

  searchUsers(searchParams: SearchParams): void {
    // navigates with the updated search parameters
    Search.updateSearchParams(searchParams, this.usersSearchParams, this.router);
  }

  getUsers(): void {
    this.usersLoading = true;
    this._findUsers({ relations: { sessions: { device: true }, emails: true } })
      .fetch({
        ...Search.searchInput(this.usersAttributes, this.usersSearchParams.search),
        pagination: {
          page: this.usersSearchParams.page,
          count: this.usersSearchParams.pageSize
        }
      })
      .subscribe({
        next: ({ data, errors }: ApolloQueryResult<{ users: { set: User[]; count: number } }>) => {
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
