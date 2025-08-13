import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, RouterModule, CommonModule ]
})
export class Register {
  registerForm: FormGroup;

  step = 1;
  showPassword = false;
  showAdminPass = false;


  constructor(
    private fb: FormBuilder,
    private authService: AuthService, 
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      employeeId: ['', [
        Validators.required,
        Validators.minLength(13),
        Validators.maxLength(13),
        Validators.pattern(/^[0-9]*$/)
      ]],
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      departamento: ['', Validators.required],
      role: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    },{ validator: this.passwordMatchValidator});
  }
  passwordMatchValidator(formGroup: FormGroup) {
  const password = formGroup.get('password')?.value;
  const confirmPassword = formGroup.get('confirmPassword')?.value;
  
    if (password !== confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ mismatch: true });
    } else {
      formGroup.get('confirmPassword')?.setErrors(null);
    }
  }

  onFieldInput(fieldName: string) {
    const control = this.registerForm.get(fieldName);
    if (control) {
      control.markAsDirty();
      control.updateValueAndValidity();
    }
  }

  showFieldError(fieldName: string): boolean {
    const control = this.registerForm.get(fieldName);
    if (!control) return false;
    
    return control.invalid && (control.touched || control.dirty);
  }

  getErrorMessage(fieldName: string): string {
    const control = this.registerForm.get(fieldName);
    
    if (!control || !control.errors) return '';
    
    if (control.errors['required']) return 'Este campo es obligatorio.';
    if (control.errors['email']) return 'Ingrese un correo válido.';
    if (control.errors['minlength']) return `Mínimo ${control.errors['minlength'].requiredLength} caracteres.`;
    if (control.errors['maxlength']) return `Máximo ${control.errors['maxlength'].requiredLength} caracteres.`;
    if (control.errors['pattern']) return 'Formato incorrecto.';
    if (control?.errors?.['mismatch']) {return 'Las contraseñas no coinciden';}
    
    return 'Campo inválido';
  }

  onRoleChange() {
    const role = this.registerForm.get('role')?.value;

    
    if (role === 'admin') {
      this.registerForm.get('adminPassword')?.setValidators([Validators.required]);
    } else {
      this.registerForm.get('adminPassword')?.clearValidators();
    }
    this.registerForm.get('adminPassword')?.updateValueAndValidity();
  }

togglePassword(fieldId: string) {
  const field = document.getElementById(fieldId) as HTMLInputElement;
  if (field) {
    field.type = field.type === 'password' ? 'text' : 'password';
  }
}

  getPasswordStrengthClass() {
    const password = this.registerForm.get('password')?.value;
    if (!password) return '';
    
    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);
    
    if (password.length < 6) return 'weak';
    if (hasLetters && hasNumbers && hasSpecial && password.length >= 10) return 'strong';
    if ((hasLetters && hasNumbers) || (hasLetters && hasSpecial) || (hasNumbers && hasSpecial)) return 'medium';
    return 'weak';
  }

  nextStep() {
    if (this.step === 1) {
      const fields = ['employeeId', 'nombres', 'apellidos', 'correo'];
      let valid = true;
      
      fields.forEach(field => {
        const control = this.registerForm.get(field);
        if (control?.invalid) {
          control.markAsTouched();
          valid = false;
        }
      });
      
      if (valid) this.step = 2;
    }
  }

  prevStep() {
    this.step = 1;
  }

    onSubmit() {
      if (this.registerForm.valid) {
        const formData = { ...this.registerForm.value };
        delete formData.confirmPassword;
        
        console.log('Enviando datos:', formData);
        
        this.authService.register(formData).subscribe({
          next: (response: any) => {
            console.log('Registro exitoso:', response);
            this.router.navigate(['/login']);
          },
          error: (error: any) => {
            console.error('Error completo:', error);
            console.error('Error del servidor:', error.error);
            alert('Error en el registro: ' + (error.error?.message || error.message));
          }
        });
      } else {
        this.registerForm.markAllAsTouched();
      }
    }
 }