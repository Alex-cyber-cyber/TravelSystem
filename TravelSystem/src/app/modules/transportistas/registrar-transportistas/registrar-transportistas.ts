import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TransportistasService } from '../transportista.service';

type StatusType = 'success' | 'danger' | '';

@Component({
  selector: 'app-transportista-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registrar-transportistas.html',
  styleUrls: ['./registrar-transportistas.scss']
})
export class TransportistaFormComponent implements OnInit {
  @Input() darkMode: boolean = false;

  loading = false;
  statusMsg = '';
  statusType: StatusType = '';

  transportistaForm!: ReturnType<FormBuilder['group']>;

    constructor(
    private fb: FormBuilder,
    private transportistasService: TransportistasService
  ) {}


    ngOnInit(): void {
    this.transportistaForm = this.fb.group({
      nombre: ['', Validators.required],
      vehiculo: ['', Validators.required],
      placa: ['', [Validators.required, Validators.pattern(/^[A-Z]{3}-?\d{3,4}$/)]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{8}$/)]],
      tarifa: ['', [Validators.required, Validators.min(5), Validators.max(50)]]
    });

    this.c('placa').valueChanges.subscribe(v => {
      if (typeof v === 'string' && v !== v.toUpperCase()) {
        this.c('placa').setValue(v.toUpperCase(), { emitEvent: false });
      }
    });

    this.c('telefono').valueChanges.subscribe(v => {
      if (typeof v === 'string') {
        const onlyDigits = v.replace(/\D+/g, '').slice(0, 8);
        if (onlyDigits !== v) {
          this.c('telefono').setValue(onlyDigits, { emitEvent: false });
        }
      }
    });
  }

  c(name: keyof typeof this.transportistaForm.controls): AbstractControl {
    return this.transportistaForm.get(name as string)!;
  }

  isInvalid(name: keyof typeof this.transportistaForm.controls): boolean {
    const ctrl = this.c(name);
    return ctrl.invalid && (ctrl.touched || ctrl.dirty);
  }

 public hardReset(): void {
    this.transportistaForm.reset();
    this.transportistaForm.markAsPristine();
    this.transportistaForm.markAsUntouched();
    this.transportistaForm.updateValueAndValidity();
  }

  private showStatus(msg: string, type: StatusType, ms = 3000) {
    this.statusMsg = msg;
    this.statusType = type;
    if (ms > 0) {
      setTimeout(() => {
        this.statusMsg = '';
        this.statusType = '';
      }, ms);
    }
  }

  onSubmit() {
    if (this.transportistaForm.invalid) {
      this.transportistaForm.markAllAsTouched();
      this.showStatus('Por favor corrige los campos marcados.', 'danger');
      return;
    }

    this.loading = true;
    this.statusMsg = '';
    this.statusType = '';

    this.transportistasService.crearTransportista(this.transportistaForm.value)
      .subscribe({
        next: () => {
          this.showStatus('Transportista registrado exitosamente.', 'success', 3000);
          this.hardReset();
          this.loading = false;
        },
        error: (err) => {
          const msg = err?.error?.message || 'No se pudo registrar. Inténtalo de nuevo.';
          this.showStatus(msg, 'danger', 5000);
          this.loading = false;
        }
      });
  }
}
