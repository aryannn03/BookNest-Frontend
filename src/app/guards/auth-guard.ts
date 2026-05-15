import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isLoggedIn()) {
        router.navigate(['/login']);
        return false;
    }

    // Check if token is expired
    if (authService.isTokenExpired()) {
        authService.clearSession();
        router.navigate(['/login']);
        return false;
    }

    return true;
};