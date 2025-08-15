import { Component, EventEmitter, Output, Inject, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DOCUMENT } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SucursalService } from '../../services/sucursal.service';

@Component({
  selector: 'app-sucursales-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule
  ],
  templateUrl: './sucursales-form.html',
  styleUrls: ['./sucursales-form.scss']
})
export class SucursalesForm {
  @Output() formSubmit = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();
  @Input() darkMode: boolean = false;

  branchForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    @Inject(DOCUMENT) private document: Document,
    private sucursalService: SucursalService, 
    private snackBar: MatSnackBar
    
  ) {
    this.branchForm = this.fb.group({
      name: ['', Validators.required],
      code: ['', [Validators.required, Validators.maxLength(10)]],
      address: ['', Validators.required],
      city: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{11}$/)]],
      email: ['', [Validators.required, Validators.email]],
      manager: ['', Validators.required],
      status: ['active', Validators.required]
    });
  }

  onSubmit(): void {
    if(this.branchForm.valid){
      this.isLoading = true;
      const formData = this.branchForm.value;

      const sucursalData = {
        name: formData.name,
        code: formData.code,
        address: formData.address,
        city: formData.city,
        phone: formData.phone,
        email: formData.email,
        manager: formData.manager,
        state: formData.status === 'active' ? 'Activa' : 'Inactiva'
      };
      this.sucursalService.crearSucursal(sucursalData).subscribe({
        next:(response) => {
          this.snackBar.open('Sucursal creada con exito', 'cerrar', {
          });
          this.formSubmit.emit(response);
          this.branchForm.reset();
          this.isLoading = false;

        }, 
        error: (error) => {
          this.snackBar.open(
            error.error?.message || 'Error al crear la sucursal', 
            'Cerrar', 
            { duration: 3000 }

          );
          this.isLoading = false;
        }
      });
    }else {
      this.branchForm.markAllAsTouched();
    }
  }
  onCancel(): void{
    this.cancel.emit();
  }
}