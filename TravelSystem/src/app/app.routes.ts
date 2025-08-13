import { Routes } from '@angular/router';
import { Register } from './modules/auth/register/register';
import { Dashboard } from './modules/dashboard/dashboard';

export const routes: Routes = [{
    path: 'login',
    loadComponent: () => import('./modules/auth/login/login').then(m => m.Login)
},
{ 
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)
  },
{path: '', redirectTo: 'login', pathMatch: 'full'},
{ path: 'register', component: Register },
{path: 'dashboard', component: Dashboard},
{path: '**', redirectTo: 'login'}];
