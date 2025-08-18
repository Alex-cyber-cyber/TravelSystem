import { Component, Inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { AsignarSucursalesService } from '../../asignar-sucursales.service';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { Subject, Subscription, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

interface ValidationMessages {
  personal_id: { required: string };
  sucursal_id: { required: string };
  distancia_km: { 
    required: string; 
    min: string; 
    max: string; 
    pattern: string;
    invalidDistance?: string;
  };
}

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
  formSubmitted: boolean = false;

  inputBusqueda$ = new Subject<string>();
  private currentSearchType: 'personal' | 'sucursal' = 'personal';
  private searchSubscription!: Subscription;

  validationMessages: ValidationMessages = {
    personal_id: {
      required: 'Debe seleccionar un colaborador'
    },
    sucursal_id: {
      required: 'Debe seleccionar una sucursal'
    },
    distancia_km: {
      required: 'La distancia es requerida',
      min: 'La distancia mínima es 1 km',
      max: 'La distancia máxima es 50 km',
      pattern: 'Debe ser un número válido (ej: 5.25)',
      invalidDistance: 'La distancia debe estar entre 1 y 50 km'
    }
  };

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
      distancia_km: ['', [
        Validators.required,
        Validators.min(0.01),
        Validators.max(50),
        Validators.pattern(/^\d+(\.\d{1,2})?$/)
      ]]
    });

    if (data?.darkMode !== undefined) {
      this.darkMode = data.darkMode;
    }

    this.setupSearch();
    this.cargarDatosIniciales();
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  getRandomColor(name: string): string {
    if (!name) return this.avatarColors[0];
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

  validarDistancia(): void {
    const control = this.asignacionForm.get('distancia_km');
    if (control && control.value > 50) {
      control.setValue(50);
      control.markAsTouched();
    } else if (control && control.value < 0.01 && control.value !== null && control.value !== '') {
      control.setValue(0.01);
      control.markAsTouched();
    }
  }

  getErrorMessage(controlName: keyof ValidationMessages): string {
    const control = this.asignacionForm.get(controlName);
    
    if (!control || !control.errors || !this.formSubmitted && !control.touched) {
      return '';
    }

    const errors = control.errors;
    
    if (errors['required']) {
      return this.validationMessages[controlName].required;
    }
    if (errors['min'] && 'min' in this.validationMessages[controlName]) {
      return (this.validationMessages[controlName] as any).min;
    }
    if (errors['max'] && 'max' in this.validationMessages[controlName]) {
      return (this.validationMessages[controlName] as any).max;
    }
    if (errors['pattern'] && controlName === 'distancia_km') {
      return this.validationMessages.distancia_km.pattern;
    }
    
    return '';
  }

  guardar(): void {
    this.formSubmitted = true;
    
    this.asignacionForm.markAllAsTouched();

    if (this.asignacionForm.valid) {
      this.showError = false;
      this.loading = true;
      
      this.asignarSucursalesService.crearAsignacion(this.asignacionForm.value).subscribe({
        next: (nuevaAsignacion) => { 
          this.loading = false;
          this.dialogRef.close(nuevaAsignacion); 
        },
        error: (err) => {
          console.error('Error al crear asignación:', err);
          this.loading = false;
          this.handleError(err);
        }
      });
    } else {
      this.errorMessage = 'Por favor complete todos los campos requeridos correctamente';
      this.showError = true;
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
}