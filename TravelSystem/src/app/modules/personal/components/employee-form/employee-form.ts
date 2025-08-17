import { Component, EventEmitter, Output, Inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DOCUMENT } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { employeeService } from '../../service/employee.service';

@Component({
  selector: 'app-employee-form',
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
  templateUrl: './employee-form.html',
  styleUrls: ['./employee-form.scss']
})
export class EmployeeForm implements OnInit {
  @Output() formSubmit = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();
  @Input() darkMode: boolean = false;

  employeeForm: FormGroup;
  isLoading = false;


  constructor(
  private fb: FormBuilder,
    @Inject(DOCUMENT) private document: Document,
    private employeeService: employeeService,
    private snackBar: MatSnackBar
  ) {
  this.employeeForm = this.fb.group({
    employeeId: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9]+$/)]],
    nombres: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{11}$/)]],
    departamento: ['', Validators.required],
    fechaContratacion: ['', Validators.required],
    estado: ['activo', Validators.required]
  });
  }

  ngOnInit(): void {
   
    
    const observer = new MutationObserver(() => {
      this.checkDarkMode();
    });
    
    observer.observe(this.document.body, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  private checkDarkMode(): void {
    this.darkMode = this.document.body.classList.contains('dark-theme');
  }



  onSubmit(): void {
    if (this.employeeForm.valid) {
      this.isLoading = true;
      const formData = this.employeeForm.value;

      this.employeeService.crearEmployees(formData).subscribe({
        next: (response: any) => {
          this.snackBar.open('Empleado creado exitosamente', 'Cerrar', { duration: 3000 });
          this.formSubmit.emit(response);
          this.employeeForm.reset();
          this.isLoading = false;
        },
        error: (error: any) => {
          this.snackBar.open(
            error.error?.message || 'Error al crear el empleado', 
            'Cerrar', 
            { duration: 3000 }
          );
          this.isLoading = false;
        }
      });
    } else {
      this.employeeForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}