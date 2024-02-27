import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { JwtHelperService } from '@auth0/angular-jwt';

import { FindUser, User } from '../shared/entities/user.entity';
import { Apollo, Query, gql } from 'apollo-angular';
import { Observable, Observer } from 'rxjs';

@Injectable()
export class AuthService {
  loggedUserChecked: boolean = false;
  loggedUserLoading: boolean = true;
  loggedUser?: User;

  isLoggedIn: Observable<User | false>;

  constructor(
    private apollo: Apollo,
    private router: Router,
    private jwtHelper: JwtHelperService,
    private loginQuery: Login,
    private findUser: FindUser
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
      this.loginQuery.fetch(credentials).subscribe({
        next: ({ data }) => {
          localStorage.setItem('token', data.login);
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

        this.findUser({ relations: { profile: true } })
          .fetch({ id: decodedUser.id })
          .subscribe({
            next: ({ data }: any) => {
              this.loggedUser = data.user;
              resolve(this.loggedUser as User);
            },
            error: (error: any) => {
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

@Injectable({ providedIn: 'root' })
export class Login extends Query<{ login: string }> {
  override document = gql`
    query Login($usernameOrEmail: String!, $password: String!) {
      login(usernameOrEmail: $usernameOrEmail, password: $password)
    }
  `;
}
