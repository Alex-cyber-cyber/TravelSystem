import { Component, Inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { AsignarSucursalesService } from '../../asignar-sucursales.service';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { Subject, Subscription, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

@Component({
  selector: 'app-formulario-asignacion',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    NgSelectModule
  ],
  templateUrl: './formulario-asignacion.html',
  styleUrls: ['./formulario-asignacion.scss']
})
export class FormularioAsignacion implements OnDestroy {
  asignacionForm: FormGroup;
  personalList: any[] = [];
  sucursalList: any[] = [];
  darkMode = false;
  errorMessage: string = '';
  showError: boolean = false;
  loading: boolean = false;

  inputBusqueda$ = new Subject<string>();
  private currentSearchType: 'personal' | 'sucursal' = 'personal';
  private searchSubscription!: Subscription;

  // Colores para avatares
  private avatarColors = [
    '#4361ee', '#7209b7', '#f72585', '#4cc9f0', 
    '#4895ef', '#3f37c9', '#560bad', '#b5179e'
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<FormularioAsignacion>,
    private asignarSucursalesService: AsignarSucursalesService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.asignacionForm = this.fb.group({
      personal_id: ['', Validators.required],
      sucursal_id: ['', Validators.required],
      distancia_km: ['', [Validators.required, Validators.min(0.01), Validators.max(50)]]
    });

    if (data?.darkMode !== undefined) {
      this.darkMode = data.darkMode;
    }

    this.setupSearch();
    this.cargarDatosIniciales();
  }

  // Genera color consistente basado en el nombre
  getRandomColor(name: string): string {
    const hash = name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    return this.avatarColors[Math.abs(hash) % this.avatarColors.length];
  }

  private setupSearch(): void {
    this.searchSubscription = this.inputBusqueda$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) => {
        if (this.currentSearchType === 'personal') {
          return this.asignarSucursalesService.buscarEmpleados(term);
        } else {
          return this.asignarSucursalesService.buscarSucursales(term);
        }
      })
    ).subscribe({
      next: (results) => {
        if (this.currentSearchType === 'personal') {
          this.personalList = results as any[];
        } else {
          this.sucursalList = results as any[];
        }
      },
      error: (err) => {
        console.error('Error en búsqueda:', err);
        if (this.currentSearchType === 'personal') {
          this.personalList = [];
        } else {
          this.sucursalList = [];
        }
      }
    });
  }

  onSearch({ term }: { term: string }, type: 'personal' | 'sucursal'): void {
    this.currentSearchType = type;
    this.inputBusqueda$.next(term);
  }

  onFocus(type: 'personal' | 'sucursal'): void {
    this.currentSearchType = type;
    if (type === 'personal' && this.personalList.length === 0) {
      this.cargarPersonal();
    } else if (type === 'sucursal' && this.sucursalList.length === 0) {
      this.cargarSucursales();
    }
  }

  cargarDatosIniciales(): void {
    this.cargarPersonal();
    this.cargarSucursales();
  }

  private cargarPersonal(): void {
    this.loading = true;
    this.asignarSucursalesService.obtenerEmployees().subscribe({
      next: (data) => {
        this.personalList = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando empleados:', err);
        this.personalList = [];
        this.loading = false;
      }
    });
  }

  private cargarSucursales(): void {
    this.loading = true;
    this.asignarSucursalesService.obtenerSucursales().subscribe({
      next: (data) => {
        this.sucursalList = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando sucursales:', err);
        this.sucursalList = [];
        this.loading = false;
      }
    });
  }

  guardar(): void {
    if (this.asignacionForm.valid) {
      this.showError = false;
      this.loading = true;
      
      this.asignarSucursalesService.crearAsignacion(this.asignacionForm.value).subscribe({
        next: () => {
          this.loading = false;
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Error al crear asignación:', err);
          this.loading = false;
          this.handleError(err);
        }
      });
    }
  }

  private handleError(error: any): void {
    this.showError = true;
    
    if (error.error?.error) {
      if (error.error.error.includes('ya está asignado')) {
        this.errorMessage = 'Error: Este colaborador ya está asignado a la sucursal seleccionada';
      } else {
        this.errorMessage = `Error del servidor: ${error.error.error}`;
      }
    } else if (error.message) {
      this.errorMessage = `Error: ${error.message}`;
    } else {
      this.errorMessage = 'Ocurrió un error desconocido al guardar la asignación';
    }
  }

  cerrar(): void {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }
}
