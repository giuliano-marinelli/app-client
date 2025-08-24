import { Injectable, inject } from '@angular/core';

import { ApolloQueryResult } from '@apollo/client';
import { JwtHelperService } from '@auth0/angular-jwt';

import { Observable, ReplaySubject } from 'rxjs';

import { FindUser, User } from '../shared/entities/user.entity';

import { MessagesService } from './messages.service';

@Injectable()
export class AuthService {
  _jwtHelper: JwtHelperService = inject(JwtHelperService);
  _messages: MessagesService = inject(MessagesService);
  _findUser: FindUser = inject(FindUser);

  user?: User;
  loading = true;
  logged: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

  constructor() {
    this.setUser();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  eraseToken(): void {
    localStorage.removeItem('token');
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  setUser(): Observable<ApolloQueryResult<{ user: User }>> | undefined {
    this.loading = true;

    const token = this.getToken();

    if (!token) {
      this.loading = false;
      this.user = undefined;
      this.logged.next(false);

      return;
    } else {
      const userId = this._jwtHelper.decodeToken(token).id;

      const obs = this._findUser({ relations: { emails: true } }).fetch({ id: userId });

      obs
        .subscribe({
          next: ({ data, errors }: any) => {
            if (errors) {
              this._messages.error(errors);
              this.eraseToken();
            }
            if (data) {
              this.user = data.user;
            }
            this.logged.next(!!this.user);
          }
        })
        .add(() => {
          this.loading = false;
        });

      return obs;
    }
  }
}
