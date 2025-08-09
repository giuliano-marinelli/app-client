import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { Observable } from 'rxjs';

import { AuthService } from '../../services/auth.service';

export const AuthAdminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return new Observable((observer) => {
    auth.logged.subscribe(() => {
      if (auth.user?.role != 'admin') router.navigate(['/']);
      observer.next(auth.user?.role == 'admin');
    });
  });
};
