import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { ApolloQueryResult } from '@apollo/client';
import { JwtHelperService } from '@auth0/angular-jwt';

import { LOGIN, LoginResult } from '../../graphql/auth.graphql';
import { USER, UserResult } from '../../graphql/users.graphql';
import { Apollo } from 'apollo-angular';
import { Observable, Observer } from 'rxjs';

import { User } from '../shared/models/user.model';

@Injectable()
export class AuthService {
  loggedUserChecked: boolean = false;
  loggedUserLoading: boolean = true;
  loggedUser?: User;

  isLoggedIn: Observable<User | false>;

  constructor(
    private apollo: Apollo,
    private router: Router,
    private jwtHelper: JwtHelperService
  ) {
    let checkLoginSubscriber = () => {
      const observers: Observer<User | false>[] = [];

      return (observer: Observer<User | false>) => {
        observers.push(observer);

        if (observers.length === 1) {
          const token = localStorage.getItem('token');
          // check if logged user is authentic by retrieving user data
          // and sending current device info
          if (!token) {
            this.loggedUserLoading = false;
            observers.forEach((obs) => obs.next(false));
            this.loggedUserChecked = true;
          } else {
            this.setLoggedUser()
              .then((loggedUser) => {
                observers.forEach((obs) => obs.next(loggedUser));
              })
              .catch((error) => {
                observers.forEach((obs) => obs.next(false));
              })
              .finally(() => {
                observers.forEach((obs) => obs.complete());
                this.loggedUserChecked = true;
              });
          }
        } else if (this.loggedUserChecked) {
          observer.next(this.loggedUser || false);
        }
      };
    };

    this.isLoggedIn = new Observable(checkLoginSubscriber());

    //this subscription is used to check at least once user data is authentic
    this.isLoggedIn.subscribe();
  }

  login(credentials: any): Promise<User> {
    console.log(credentials);
    return new Promise((resolve, reject) => {
      (
        this.apollo.query({
          query: LOGIN,
          variables: credentials
        }) as Observable<ApolloQueryResult<LoginResult>>
      ).subscribe({
        next: (res) => {
          localStorage.setItem('token', res.data.login);
          this.setLoggedUser()
            .then((loggedUser) => {
              this.router.navigate(['/']);
              resolve(loggedUser);
            })
            .catch((error) => {
              localStorage.removeItem('token');
              reject(error);
            });
        },
        error: (error) => reject(error)
      });
    });
  }

  logout(): void {
    delete this.loggedUser;
    localStorage.removeItem('token');
    this.router.navigate(['/']);
  }

  setLoggedUser(): Promise<User> {
    return new Promise((resolve, reject) => {
      const token = localStorage.getItem('token');

      if (token) {
        let decodedUser = new User();
        decodedUser.id = this.jwtHelper.decodeToken(token).id;

        (
          this.apollo.query({
            query: USER,
            variables: {
              id: decodedUser.id,
              includeProfile: true
            }
          }) as Observable<ApolloQueryResult<UserResult>>
        )
          .subscribe({
            next: (res) => {
              this.loggedUser = res.data.user;
              resolve(this.loggedUser);
            },
            error: (error) => {
              reject(error);
            }
          })
          .add(() => (this.loggedUserLoading = false));
      } else {
        this.logout();
        reject('No token found');
      }
    });
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isAdmin(): boolean {
    return this.loggedUser?.role == 'admin';
  }

  isVerified(): boolean {
    return this.loggedUser?.verified || false;
  }
}
