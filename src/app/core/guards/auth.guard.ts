import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, of, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn) {
    return true;
  }
  return router.createUrlTree(['/auth/login']);
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn) {
    return true;
  }
  return router.createUrlTree(['/app/dashboard']);
};

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn) {
    return router.createUrlTree(['/auth/login']);
  }

  const user = auth.currentUser();
  if (user) {
    return user.role === 'admin' ? true : router.createUrlTree(['/app/dashboard']);
  }

  return auth.loadProfile().pipe(
    switchMap((u) => of(u.role === 'admin')),
    map((ok) => (ok ? true : router.createUrlTree(['/app/dashboard']))),
  );
};
