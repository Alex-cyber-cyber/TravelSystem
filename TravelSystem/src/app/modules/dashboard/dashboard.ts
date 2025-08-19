import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { Subscription } from 'rxjs';
import { SucursalesForm } from '../sucursales/components/sucursales-form/sucursales-form';
import { MatDialog } from '@angular/material/dialog';
import { EmployeeForm } from '../personal/components/employee-form/employee-form';
import { AsignarSucursales } from '../asignar-sucursales/components/asignar-sucursales/asignar-sucursales';
import { TransportistaFormComponent } from '../transportistas/registrar-transportistas/registrar-transportistas';
import { RegistroViajesComponent } from '../trip/registro-viajes/registro-viajes';
import { ReporteTransportistasComponent } from '../../pages/reportes/reportes-transportistas/reporte-transportistas';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet,SucursalesForm, EmployeeForm,AsignarSucursales, TransportistaFormComponent, RegistroViajesComponent, ReporteTransportistasComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit, OnDestroy {

  menuActive = false;
  showUserMenu = false;
  sucursalesMenuOpen = true;
  viajesMenuOpen = true;
  activeItem = 'dashboard';
  

  darkMode = false;
  
  userName = 'Cargando...';
  userInitials = 'CU';
  userEmail = '';
  userRole = '';
  userAvatarColor = '#4361ee'; 
  personalMenuOpen = true;
  employeeMenuOpen = true;

  unreadNotifications = 3;
  transportistasMenuOpen = true;


  
  private userSub!: Subscription;
  


  constructor(
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initializeTheme();
    this.initializeUserData();
  }

  ngOnDestroy(): void {
    this.cleanUpSubscriptions();
  }

  private initializeTheme(): void {
    const savedTheme = localStorage.getItem('darkMode');
    this.darkMode = savedTheme ? savedTheme === 'true' : 
      (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    document.body.classList.toggle('dark-theme', this.darkMode);
  }

  private initializeUserData(): void {
    this.userSub = this.authService.currentUser.subscribe(user => {
      if (user) {
        this.userName = user.nombres || 'Usuario';
        this.userEmail = user.correo || '';
        this.userRole = user.role || 'Usuario';
        this.generateUserInitials();
        
        this.generateAvatarColor();
      } else {
        this.resetUserData();
      }
    });
  }

  private generateUserInitials(): void {
    const names = this.userName.split(' ');
    this.userInitials = names.length >= 2 
      ? `${names[0][0]}${names[1][0]}`.toUpperCase()
      : this.userName.substring(0, 2).toUpperCase();
  }

  private generateAvatarColor(): void {
    if (this.userEmail) {
      let hash = 0;
      for (let i = 0; i < this.userEmail.length; i++) {
        hash = this.userEmail.charCodeAt(i) + ((hash << 5) - hash);
      }
      
      const hue = hash % 360;
      this.userAvatarColor = `hsl(${hue}, 70%, 50%)`;
    }
  }

  private resetUserData(): void {
    this.userName = 'Invitado';
    this.userInitials = 'IN';
    this.userEmail = '';
    this.userRole = 'Invitado';
    this.userAvatarColor = '#4361ee';
  }

  private cleanUpSubscriptions(): void {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }

  toggleMenu(): void {
    this.menuActive = !this.menuActive;
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }
  

  closeUserMenu(): void {
    this.showUserMenu = false;
  }
  

toggleSubmenu(menu: string): void {
    switch(menu) {
      case 'sucursales':
        this.sucursalesMenuOpen = !this.sucursalesMenuOpen;
        break;
      case 'viajes':
        this.viajesMenuOpen = !this.viajesMenuOpen;
        break;
      case 'empleados':
        this.employeeMenuOpen = !this.employeeMenuOpen;
        break;
      case 'transportistas':
        this.transportistasMenuOpen = !this.transportistasMenuOpen;
        break;
    }
  }
  setActive(item: string): void {
    this.activeItem = item;
    if (window.innerWidth < 992) {
      this.menuActive = false;
    }
  }

  toggleTheme(): void {
    this.darkMode = !this.darkMode;
    document.body.classList.toggle('dark-theme', this.darkMode);
    localStorage.setItem('darkMode', this.darkMode.toString());
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  get userDisplayRole(): string {
    return this.userRole === 'admin' ? 'Administrador' : 
           this.userRole === 'user' ? 'Usuario' : this.userRole;
  }

  get avatarStyle(): { [key: string]: string } {
    return {
      'background-color': this.userAvatarColor,
      'color': 'white'
    };
  }
  
   handleRegistrarEmpleado(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        this.setActive('registrar-empleado');
      }
    openEmpleadoForm(): void {
      if (!this.authService.isAuthenticated()) {
        this.router.navigate(['/login']);
        return;
      }

      const dialogRefEmployee = this.dialog.open(EmployeeForm, {
        width: '800px',
        disableClose: true,
        panelClass: this.darkMode ? 'dark-theme' : ''
      });
      dialogRefEmployee.afterClosed().subscribe(result => {
        console.log('El diálogo de empleado fue cerrado');
      });
    }
    
  handleRegistrarSucursal(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.setActive('registrar-sucursal');
    this.openSucursalForm();
  }


  openSucursalForm(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
 
    const dialogRef = this.dialog.open(SucursalesForm, {
      width: '800px',
      disableClose: true,
      panelClass: this.darkMode ? 'dark-theme' : ''
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('El diálogo fue cerrado');
    });
  }

  handleAsignarSucursales(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.setActive('asignar-sucursales');
  }
  handleRegistrarTransportista(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.setActive('registrar-transportista');
    //this.openTransportistaForm();
  }
    handleReporteTransportista(event: Event): void {
      event.preventDefault();
      event.stopPropagation();
      this.setActive('reporte-transportistas'); 
    }

  openReporteTransportistaForm(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    const dialogRef = this.dialog.open(ReporteTransportistasComponent, {
      width: '600px',
      disableClose: true,
      panelClass: this.darkMode ? 'dark-theme' : ''
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('El diálogo de reporte de transportista fue cerrado');
    });
  }

  openTransportistaForm(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    const dialogRef = this.dialog.open(TransportistaFormComponent, {
      width: '600px',
      disableClose: true,
      panelClass: this.darkMode ? 'dark-theme' : ''
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('El diálogo de transportista fue cerrado');
    });
  }
  handleRegistrarViaje(event: Event): void {
  event.preventDefault();
  event.stopPropagation();
  this.setActive('registrar-viaje');
  }

}


