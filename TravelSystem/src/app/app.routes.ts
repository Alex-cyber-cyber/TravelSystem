import { Routes } from '@angular/router';
import { Register } from './modules/auth/register/register';
import { Dashboard } from './modules/dashboard/dashboard';
import { authGuard } from './core/guards/auth.guard';
import { SucursalesForm } from './modules/sucursales/components/sucursales-form/sucursales-form';
import { EmployeeForm } from './modules/personal/components/employee-form/employee-form';
import { AsignarSucursales } from './modules/asignar-sucursales/components/asignar-sucursales/asignar-sucursales';
import { TransportistaFormComponent } from './modules/transportistas/registrar-transportistas/registrar-transportistas';
import { RegistroViajesComponent } from './modules/trip/registro-viajes/registro-viajes';

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
{path: 'dashboard', component: Dashboard, canActivate: [authGuard], 
  children: [
  {path: 'sucursales', component: SucursalesForm},
  {path: 'employee', component: EmployeeForm},
  {path: 'asignar-sucursales', component: AsignarSucursales},
  {path: 'registrar-transportista', component: TransportistaFormComponent},
  {path: 'registrar-viajes', component: RegistroViajesComponent}
]},
{path: '**', redirectTo: 'login'}];
