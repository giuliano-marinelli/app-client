import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { IconName } from '@fortawesome/fontawesome-svg-core';

import { CloseSession, Session } from '../../shared/entities/session.entity';
import { FindUsers, User } from '../../shared/entities/user.entity';
import { Global } from '../../shared/global/global';
import { NgxMasonryComponent } from 'ngx-masonry';
import { Observable } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { MessagesService } from '../../services/messages.service';

@Component({
  selector: 'app-users-admin',
  templateUrl: './users-admin.component.html',
  styleUrls: ['./users-admin.component.scss']
})
export class UsersAdminComponent implements OnInit {
  @ViewChild('message_container') messageContainer!: ElementRef;

  filter: any = Global.filter;

  usersLoading: boolean = true;
  submitLoading: string[] = [];

  users: User[] = [];
  usersPage: number = 1;
  usersPageSize: number = 12;
  usersCount: number = 0;
  usersSearch: any;

  constructor(
    public auth: AuthService,
    public router: Router,
    public messages: MessagesService,
    public _findUsers: FindUsers,
    public _closeSession: CloseSession
  ) {}

  @HostListener('window:beforeunload', ['$event'])
  canDeactivate(): Observable<boolean> | boolean {
    return !this.hasChanges();
  }

  hasChanges(): boolean {
    return false;
  }

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers(): void {
    this.usersLoading = true;
    this._findUsers({ relations: { sessions: { device: true }, emails: true } })
      .fetch({
        ...this.usersSearch,
        pagination: {
          page: this.usersPage,
          count: this.usersPageSize
        }
      })
      .subscribe({
        next: ({ data, errors }: any) => {
          if (errors)
            this.messages.error(errors, {
              onlyOne: true,
              displayMode: 'replace',
              target: this.messageContainer
            });
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

  deleteUser(user: User): void {
    // if (user._id) this.submitLoading.push(user._id);
    // this.userService.deleteUser(user).subscribe({
    //   next: (data) => {
    //     this.getUsers();
    //     this.message.success('User succesfully deleted.', { onlyOne: true, displayMode: 'replace', target: this.messageContainer });
    //   },
    //   error: (error) => {
    //     this.message.error(error, { onlyOne: true, displayMode: 'replace', target: this.messageContainer });
    //   }
    // }).add(() => {
    //   this.submitLoading = this.submitLoading.filter(id => id != user._id)
    // });
  }

  closeSession(session: Session, user: User): void {
    if (session.id) this.submitLoading.push(session.id);
    this._closeSession
      .mutate({ id: session.id })
      .subscribe({
        next: ({ data, errors }) => {
          if (errors)
            this.messages.error(errors, {
              close: false,
              onlyOne: true,
              displayMode: 'replace',
              target: this.messageContainer
            });
          if (data?.closeSession) {
            this.getUsers();
            this.messages.success('Session successfully closed.', {
              onlyOne: true,
              displayMode: 'replace'
              // target: this.messageContainer
            });
          }
        }
      })
      .add(() => {
        this.submitLoading = this.submitLoading.filter((id) => id != session.id);
      });
  }

  browserIcon(client: string = ''): IconName {
    if (client.includes('Chrome')) return 'chrome';
    else if (client.includes('Firefox')) return 'firefox';
    else if (client.includes('Safari')) return 'safari';
    // else if (client.includes('Opera')) return 'opera';
    else if (client.includes('Edge')) return 'edge';
    else if (client.includes('Internet Explorer')) return 'internet-explorer';
    else return 'circle-question';
  }
}
