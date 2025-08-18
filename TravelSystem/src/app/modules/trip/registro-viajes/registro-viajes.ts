import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { AsignarSucursalesService } from '../../asignar-sucursales/asignar-sucursales.service';
import { TransportistasService } from '../../transportistas/transportista.service';
import { ViajesService } from '../viajes.service';

@Component({
  selector: 'app-registro-viajes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './registro-viajes.html',
  styleUrls: ['./registro-viajes.scss']
})
export class RegistroViajesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private asignarSucursalesService = inject(AsignarSucursalesService);
  private transportistasService = inject(TransportistasService);
  private viajesService = inject(ViajesService);
  @Input() darkMode: boolean = false;

  sucursales: any[] = [];
  colaboradores: any[] = [];
  transportistas: any[] = [];
  viajeForm: FormGroup;
  totalKm = 0;
  currentUser: any;

ngOnInit(): void {
  (this.authService as any).currentUser?.subscribe?.((u: any) => {
    this.currentUser = u;
  });
}


  constructor() {
    this.currentUser = (this.authService as any).currentUser?.value;


    
    this.viajeForm = this.fb.group({
      fecha: [new Date().toISOString().substring(0, 10), Validators.required],
      sucursal_id: ['', Validators.required],
      transportista_id: ['', Validators.required],
      colaboradores: this.fb.array([], Validators.required),
      observaciones: ['']
    });

    this.loadSucursales();
    this.loadTransportistas();
  }


  loadSucursales() {
    this.asignarSucursalesService.obtenerSucursales().subscribe({
      next: (res: any) => this.sucursales = res,
      error: (err: any) => console.error(err)
    });
  }

  loadTransportistas() {
    this.transportistasService.obtenerTransportistas().subscribe({
      next: (res: any) => this.transportistas = res,
      error: (err: any) => console.error(err)
    });
  }
  getTarifaTransportista(): number {
  const transportistaId = this.viajeForm.get('transportista_id')?.value;
  if (!transportistaId) return 0;
  
  const transportista = this.transportistas.find(t => t._id === transportistaId);
  return transportista?.tarifa || 0;
}

  onSucursalChange() {
    const sucursalId = this.viajeForm.get('sucursal_id')?.value;
    this.asignarSucursalesService.obtenerColaboradoresPorSucursal(sucursalId).subscribe({
      next: (res: any) => {
        this.colaboradores = res.map((c: any) => ({
          ...c,
          selected: false,
          disabled: false
        }));
        this.checkViajesDelDia();
      },
      error: (err) => console.error(err)
    });
  }

  checkViajesDelDia() {
    const fecha = this.viajeForm.get('fecha')?.value;
    this.viajesService.getViajesPorFecha(fecha).subscribe((viajes: any) => {
      const colaboradoresConViaje = Array.isArray(viajes)
        ? viajes.map((v: any) => v.colaboradores).flat()
        : [];
      this.colaboradores = this.colaboradores.map(c => ({
        ...c,
        disabled: colaboradoresConViaje.includes(c._id)
      }));
    });
  }

  toggleColaborador(colaborador: any) {
    colaborador.selected = !colaborador.selected;
    this.updateTotalKm();
  }

  updateTotalKm() {
    this.totalKm = this.colaboradores
      .filter(c => c.selected)
      .reduce((sum, c) => sum + c.distancia_km, 0);
  }
    get tarifaSeleccionada(): number {
    const id = this.viajeForm.get('transportista_id')?.value;
    const t = this.transportistas?.find((x: any) => x?._id === id);
    return t?.tarifa ?? 0;
  }

  get costoEstimado(): number {
    return this.totalKm * this.tarifaSeleccionada;
  }


  onSubmit() {
    if (this.viajeForm.invalid || this.totalKm > 100) return;

    const formData = {
      ...this.viajeForm.value,
      colaboradores: this.colaboradores.filter(c => c.selected).map(c => c._id),
      registrado_por: this.currentUser?._id ?? null,
      total_km: this.totalKm,
      tarifa_total: this.transportistas.find(t => t._id === this.viajeForm.get('transportista_id')?.value)?.tarifa
    };
    

    this.viajesService.crearViaje(formData).subscribe({
      next: (res) => {
        alert('Viaje registrado exitosamente');
        this.viajeForm.reset();
        this.totalKm = 0;
      },
      error: (err) => alert('Error al registrar el viaje')
    });
  }
}