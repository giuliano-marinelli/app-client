import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { Observable } from 'rxjs';

import { AuthService } from '../../services/auth.service';

export const AuthLoginGuard: CanActivateFn = () => {
  return new Observable((observer) => {
    inject(AuthService).isLoggedIn.subscribe({
      next: (loggedUser) => {
        if (!loggedUser) inject(Router).navigate(['/']);
        observer.next(loggedUser ? true : false);
      }
    });
  });
};
