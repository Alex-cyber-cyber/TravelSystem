import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { AuthService } from "../auth/auth.service";
import { map, Observable } from "rxjs";

export const authGuard = (requiredRole?: string): CanActivateFn => {
  return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      return authService.checkAuth().pipe(
        map(isAuthenticated => {
          if (!isAuthenticated) {
            return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
          }
          if (requiredRole && !authService.hasRole(requiredRole)) {
            return router.createUrlTree(['/unauthorized']);
          }
          return true;
        })
      );
    }

    if (requiredRole && !authService.hasRole(requiredRole)) {
      return router.createUrlTree(['/unauthorized']);
    }

    return true;
  };
};