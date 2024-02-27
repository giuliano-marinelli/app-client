import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { Observable } from 'rxjs';

import { AuthService } from '../../services/auth.service';

export const AuthAdminGuard: CanActivateFn = () => {
  return new Observable((observer) => {
    inject(AuthService).isLoggedIn.subscribe({
      next: (loggedUser) => {
        if (!inject(AuthService).isAdmin()) inject(Router).navigate(['/']);
        observer.next(inject(AuthService).isAdmin());
      }
    });
  });
};
