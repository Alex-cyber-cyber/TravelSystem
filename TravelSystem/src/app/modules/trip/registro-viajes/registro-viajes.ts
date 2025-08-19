import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidatorFn } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { AuthService } from '../../../core/auth/auth.service';
import { AsignarSucursalesService } from '../../asignar-sucursales/asignar-sucursales.service';
import { TransportistasService } from '../../transportistas/transportista.service';
import { ViajesService } from '../viajes.service';

type StatusType = 'success' | 'danger' | '';

interface ColaboradorOption {
  id: string;
  label: string;
  distancia_km: number;
  disabled?: boolean;
}

function requiredArray(): ValidatorFn {
  return (control: AbstractControl) => {
    const v = control.value;
    return Array.isArray(v) && v.length > 0 ? null : { required: true };
  };
}

@Component({
  selector: 'app-registro-viajes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NgSelectModule],
  templateUrl: './registro-viajes.html',
  styleUrls: ['./registro-viajes.scss']
})
export class RegistroViajesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private sucService = inject(AsignarSucursalesService);
  private transpService = inject(TransportistasService);
  private viajesService = inject(ViajesService);

  @Input() darkMode = false;

  viajeForm!: FormGroup;
  sucursales: any[] = [];
  transportistas: any[] = [];
  colaboradoresOptions: ColaboradorOption[] = [];
  totalKm = 0;

  statusMsg = '';
  statusType: StatusType = '';
  loading = false;

  currentUser: any;
  canRegistrar = false;
  userReady = false;

  private prevSelectedIds: string[] = [];

  ngOnInit(): void {
    // 1) Cargar usuario solo de storage/token para NO llamar /auth/me aquí.
    const localUser = this.authService.getCurrentUser();
    const decoded = this.authService.getDecodedToken();
    this.applyUser(localUser, decoded);

    this.viajeForm = this.fb.group({
      fecha: [new Date().toISOString().substring(0, 10), Validators.required],
      sucursal_id: ['', Validators.required],
      transportista_id: ['', Validators.required],
      colaboradores: this.fb.control<string[]>([], requiredArray()),
      observaciones: ['']
    });

    this.loadSucursales();
    this.loadTransportistas();

    this.viajeForm.get('sucursal_id')?.valueChanges.subscribe((id: string) => {
      this.loadColaboradores(id);
      this.viajeForm.get('colaboradores')?.setValue([]);
    });

    this.viajeForm.get('fecha')?.valueChanges.subscribe(() => this.markBusyCollaborators());
    this.viajeForm.get('colaboradores')?.valueChanges.subscribe((ids: string[]) => this.applyKmLimit(ids));
  }

  private applyUser(user: any, decoded?: any) {
    this.currentUser = user;

    const roleNorm = (user?.role ?? user?.rol ?? decoded?.role ?? '').toString().toLowerCase();
    const deptNorm = (user?.departamento ?? user?.department ?? decoded?.departamento ?? '').toString().toLowerCase();

    const isAdmin = roleNorm.includes('admin');
    const isGerenteTienda = roleNorm.includes('gerente') && (deptNorm.includes('tienda') || roleNorm.includes('tienda'));

    this.canRegistrar = isAdmin || isGerenteTienda;
    this.userReady = true;
  }

  private getUserId(): string | null {
    const decoded = this.authService.getDecodedToken();
    return this.currentUser?._id ?? (this.currentUser as any)?.id ?? decoded?.sub ?? null;
  }

  isInvalid(ctrl: string): boolean {
    const c = this.viajeForm.get(ctrl);
    return !!(c && c.invalid && (c.touched || c.dirty));
  }

  get submitDisabled(): boolean {
    return !this.canRegistrar || this.viajeForm.invalid || this.totalKm > 100 || this.loading;
  }

  get submitDisabledReasons(): string[] {
    const reasons: string[] = [];
    if (!this.canRegistrar) reasons.push('No tiene permisos (solo Gerente de tienda o Admin).');
    if (this.viajeForm.get('fecha')?.invalid) reasons.push('Seleccione una fecha válida.');
    if (this.viajeForm.get('sucursal_id')?.invalid) reasons.push('Seleccione una sucursal.');
    if (this.viajeForm.get('transportista_id')?.invalid) reasons.push('Seleccione un transportista.');
    if (this.viajeForm.get('colaboradores')?.hasError('required')) reasons.push('Seleccione al menos un colaborador.');
    if (this.totalKm > 100) reasons.push('La suma de distancias supera 100 km.');
    return reasons;
  }

  loadSucursales() {
    this.sucService.obtenerSucursales().subscribe({
      next: (res: any) => this.sucursales = this.normalizeArray(res),
      error: (err) => console.error('Error cargando sucursales:', err)
    });
  }

  loadTransportistas() {
    this.transpService.obtenerTransportistas().subscribe({
      next: (res: any) => this.transportistas = this.normalizeArray(res),
      error: (err) => console.error('Error cargando transportistas:', err)
    });
  }

  loadColaboradores(sucursalId: string) {
    if (!sucursalId) {
      this.colaboradoresOptions = [];
      this.totalKm = 0;
      return;
    }
    this.sucService.obtenerColaboradoresPorSucursal(sucursalId).subscribe({
      next: (res: any) => {
        const arr = this.normalizeArray(res, ['colaboradores']);
        this.colaboradoresOptions = arr.map((c: any) => ({
          id: c?._id ?? c?.personal_id?._id ?? c?.personal_id ?? c?.id,
          label: c?.personal_id?.nombres ?? c?.nombres ?? '—',
          distancia_km: Number(c?.distancia_km ?? 0),
          disabled: false
        }));
        this.prevSelectedIds = [];
        this.totalKm = 0;
        this.markBusyCollaborators();
      },
      error: (err) => {
        console.error('Error cargando colaboradores:', err);
        this.colaboradoresOptions = [];
        this.prevSelectedIds = [];
        this.totalKm = 0;
      }
    });
  }

  markBusyCollaborators() {
    const fecha = this.viajeForm.get('fecha')?.value;
    if (!fecha || !this.colaboradoresOptions.length) return;

    this.viajesService.getViajesPorFecha(fecha).subscribe({
      next: (viajes: any) => {
        const idsConViaje = Array.isArray(viajes)
          ? viajes.flatMap((v: any) => Array.isArray(v?.colaboradores) ? v.colaboradores.map((x: any) => x?.toString?.() ?? String(x)) : [])
          : [];

        const currentIds = (this.viajeForm.get('colaboradores')?.value as string[]) || [];
        const filtered = currentIds.filter(id => !idsConViaje.includes(id));

        if (filtered.length !== currentIds.length) {
          this.viajeForm.get('colaboradores')?.setValue(filtered, { emitEvent: false });
        }

        this.colaboradoresOptions = this.colaboradoresOptions.map(opt => ({
          ...opt,
          disabled: idsConViaje.includes(opt.id)
        }));

        this.totalKm = this.computeKm(filtered);
        this.prevSelectedIds = filtered.slice();
      },
      error: (err) => console.error('Error check viajes por fecha:', err)
    });
  }

  normalizeArray(res: any, keys: string[] = []): any[] {
    if (Array.isArray(res)) return res;
    for (const k of ['data', 'items', 'results', ...keys]) {
      if (Array.isArray(res?.[k])) return res[k];
    }
    return [];
  }

  get tarifaSeleccionada(): number {
    const id = this.viajeForm.get('transportista_id')?.value;
    const t = this.transportistas?.find((x: any) => x?._id === id) ?? {};
    return Number(t?.tarifa ?? 0);
  }

  computeKm(ids: string[]): number {
    const map = new Map(this.colaboradoresOptions.map(o => [o.id, o.distancia_km]));
    return (ids || []).reduce((sum, id) => sum + Number(map.get(id) || 0), 0);
  }

  applyKmLimit(ids: string[]) {
    const km = this.computeKm(ids);
    if (km > 100) {
      this.showStatus('La suma de distancias no puede superar los 100 km.', 'danger', 2500);
      this.viajeForm.get('colaboradores')?.setValue(this.prevSelectedIds, { emitEvent: false });
      return;
    }
    this.totalKm = km;
    this.prevSelectedIds = (ids || []).slice();
  }

  get costoEstimado(): number {
    return this.totalKm * this.tarifaSeleccionada;
  }

  showStatus(msg: string, type: StatusType, ms = 3000) {
    this.statusMsg = msg;
    this.statusType = type;
    if (ms > 0) setTimeout(() => { this.statusMsg = ''; this.statusType = ''; }, ms);
  }

  resetForm(): void {
    this.viajeForm.reset({
      fecha: new Date().toISOString().substring(0, 10),
      sucursal_id: '',
      transportista_id: '',
      colaboradores: [],
      observaciones: ''
    });
    this.colaboradoresOptions = [];
    this.prevSelectedIds = [];
    this.totalKm = 0;
  }

  onSubmit() {
    if (!this.canRegistrar) {
      this.showStatus('No tiene permisos para registrar viajes (solo Gerente de tienda o Admin).', 'danger', 4000);
      return;
    }

    if (this.viajeForm.invalid || this.totalKm > 100) {
      this.viajeForm.markAllAsTouched();
      this.showStatus('Por favor complete los campos requeridos correctamente.', 'danger');
      return;
    }

    const selectedIds = this.viajeForm.get('colaboradores')?.value as string[];

    const payload = {
      ...this.viajeForm.value,
      colaboradores: selectedIds,
      registrado_por: this.getUserId(),
      total_km: this.totalKm,
      tarifa_total: this.tarifaSeleccionada
    };

    this.loading = true;
    this.viajesService.crearViaje(payload).subscribe({
      next: () => {
        this.loading = false;
        this.showStatus('Viaje registrado exitosamente.', 'success', 2500);
        this.resetForm();
      },
      error: (err) => {
        this.loading = false;
        let msg = 'Error al registrar el viaje.';
        if (err?.status === 409) {
          msg = 'Uno o más colaboradores ya tienen viaje en esa fecha.';
        } else if (err?.status === 400) {
          msg = err?.error?.error || 'Datos incompletos o no válidos.';
        } else if (err?.error?.message) {
          msg = err.error.message;
        }
        this.showStatus(msg, 'danger', 5000);
      }
    });
  }
}
