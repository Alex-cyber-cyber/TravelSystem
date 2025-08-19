import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AsignarSucursalesService } from '../../asignar-sucursales/asignar-sucursales.service';
import { TransportistasService } from '../../transportistas/transportista.service';
import { environment } from '../../../../environments/enviroment';
import * as XLSX from 'xlsx';

type Row = {
  _id: string;
  fecha: string | Date;
  fecha_registro?: string | Date; 
  sucursal?: any;
  sucursal_id?: any;
  transportista?: any;
  transportista_id?: any;
  colaboradores: any[];
  registrado_por?: any;
  total_km: number;
  tarifa_total?: number;
  tarifa_por_km?: number;
  observaciones?: string;
};

@Component({
  selector: 'app-viajes-historial',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './viajes-historial.componente.html'
})
export class ViajesHistorialComponent implements OnInit {
  @Input() darkMode = false;

  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private sucService = inject(AsignarSucursalesService);
  private transpService = inject(TransportistasService);

  filtros!: FormGroup;
  sucursales: any[] = [];
  transportistas: any[] = [];
  rowsFull: Row[] = [];
  rows: Row[] = [];

  page = 1;
  limit = 10;
  total = 0;
  loading = false;
  errorMsg = '';

  ngOnInit(): void {
    const hoy = new Date().toISOString().substring(0, 10);
    this.filtros = this.fb.group({
      desde: [hoy],
      hasta: [hoy],
      sucursal_id: [''],
      transportista_id: ['']
    });
    this.loadSucursales();
    this.loadTransportistas();
    this.buscar();
  }

  loadSucursales(): void {
    this.sucService.obtenerSucursales().subscribe({
      next: (res: any) => {
        this.sucursales = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      }
    });
  }

  loadTransportistas(): void {
    this.transpService.obtenerTransportistas().subscribe({
      next: (res: any) => {
        this.transportistas = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      }
    });
  }

  buscar(): void {
    this.loading = true;
    this.errorMsg = '';
    this.page = 1;

    const { desde, hasta, sucursal_id, transportista_id } = this.filtros.value as {
      desde: string; hasta: string; sucursal_id?: string; transportista_id?: string;
    };

    let params = new HttpParams().set('desde', desde || '').set('hasta', hasta || '');
    if (sucursal_id) params = params.set('sucursal_id', sucursal_id);
    if (transportista_id) params = params.set('transportista_id', transportista_id);

    this.http.get<any>(`${environment.apiUrl}/viajes/historial`, { params }).subscribe({
      next: (res) => {
        const list: any[] = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
        this.rowsFull = list.map(v => ({
          _id: String(v?._id || ''),
          fecha: v?.fecha,
          fecha_registro: v?.fecha_registro || v?.fecha,
          sucursal: v?.sucursal || v?.sucursal_id,
          sucursal_id: v?.sucursal_id,
          transportista: v?.transportista || v?.transportista_id,
          transportista_id: v?.transportista_id,
          colaboradores: Array.isArray(v?.colaboradores) ? v.colaboradores : [],
          registrado_por: v?.registrado_por,
          total_km: Number(v?.total_km || 0),
          tarifa_total: v?.tarifa_total !== undefined ? Number(v.tarifa_total) : undefined,
          tarifa_por_km: v?.tarifa_por_km !== undefined ? Number(v.tarifa_por_km) : undefined,
          observaciones: v?.observaciones || ''
        }));
        this.total = this.rowsFull.length;
        this.updatePaged();
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = err?.error?.error || 'Error cargando historial';
        this.rowsFull = [];
        this.rows = [];
        this.total = 0;
        this.loading = false;
      }
    });
  }

  onLimitChange(event: Event): void {
    const val = Number((event.target as HTMLSelectElement).value);
    this.changeLimit(val);
  }

  changeLimit(value: number): void {
    this.limit = Number.isFinite(value) && value > 0 ? value : 10;
    this.page = 1;
    this.updatePaged();
  }

  changePage(step: number): void {
    const next = this.page + step;
    const maxPage = Math.max(1, Math.ceil(this.total / this.limit));
    this.page = Math.min(Math.max(1, next), maxPage);
    this.updatePaged();
  }

  updatePaged(): void {
    const start = (this.page - 1) * this.limit;
    const end = start + this.limit;
    this.rows = this.rowsFull.slice(start, end);
  }

  get pageStart(): number {
    if (this.total === 0) return 0;
    return (this.page - 1) * this.limit + 1;
  }

  get pageEnd(): number {
    return Math.min(this.page * this.limit, this.total);
  }

  trackRow(_: number, r: Row): string {
    return r._id;
  }

  nombreSucursal(v: Row): string {
    const s = v.sucursal || v.sucursal_id;
    return s?.name || s?.nombre || '—';
  }

  nombreTransportista(v: Row): string {
    const t = v.transportista || v.transportista_id;
    return t?.nombre || '—';
  }

  nombresColaboradores(v: Row): string {
    if (!Array.isArray(v.colaboradores) || v.colaboradores.length === 0) return '—';
    const names = v.colaboradores.map((c: any) => c?.nombres || c?.nombre).filter(Boolean);
    return names.length ? names.join(', ') : `${v.colaboradores.length}`;
  }

  nombreRegistrador(v: Row): string {
    const r = v.registrado_por;
    return r?.nombres || r?.nombre || '—';
  }

  montoViaje(v: Row): number {
    if (typeof v.tarifa_por_km === 'number' && v.tarifa_por_km > 0) return v.total_km * v.tarifa_por_km;
    if (typeof v.tarifa_total === 'number') return v.tarifa_total * v.total_km;
    return 0;
  }

  clear(): void {
    const hoy = new Date().toISOString().substring(0, 10);
    this.filtros.patchValue({ desde: hoy, hasta: hoy, sucursal_id: '', transportista_id: '' });
    this.buscar();
  }

  exportarExcel(): void {
    const data = this.rowsFull.map(v => ({
      Fecha: new Date(v.fecha).toLocaleDateString(),
      fecha_registro: v.fecha_registro ? new Date(v.fecha_registro).toLocaleDateString() : '',
      Sucursal: this.nombreSucursal(v),
      Transportista: this.nombreTransportista(v),
      Colaboradores: this.nombresColaboradores(v),
      RegistradoPor: this.nombreRegistrador(v),
      KM: v.total_km,
      TarifaPorKm: v.tarifa_por_km ?? v.tarifa_total ?? 0,
      Monto: this.montoViaje(v),
      Observaciones: v.observaciones || ''
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Historial');
    XLSX.writeFile(wb, `historial_viajes_${new Date().toISOString().substring(0,10)}.xlsx`);
  }
}
