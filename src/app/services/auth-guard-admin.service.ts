import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';

import { AuthService } from './auth.service';

@Injectable()
export class AuthGuardAdmin {
  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return new Observable((observer) => {
      this.auth.isLoggedIn.subscribe({
        next: (loggedUser) => {
          if (!this.auth.isAdmin()) this.router.navigate(['/']);
          observer.next(this.auth.isAdmin());
        }
      });
    });
  }
}
