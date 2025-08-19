import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

import { ReportesService } from '../reporte.service';
import { TransportistasService } from '../../../modules/transportistas/transportista.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-reporte-transportistas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './reporte-transportistas.html',
  styleUrls: ['./reporte-transportistas.scss'],
  providers: [DatePipe, CurrencyPipe]
})
export class ReporteTransportistasComponent implements OnInit {
  private fb = inject(FormBuilder);
  private reportesService = inject(ReportesService);
  private transpService = inject(TransportistasService);

  filtros = this.fb.group({
    desde: [new Date().toISOString().substring(0,10), Validators.required],
    hasta: [new Date().toISOString().substring(0,10), Validators.required],
    transportista_id: [''] 
  });

  transportistas: any[] = [];
  loading = false;
  errorMsg = '';

  detalle: any[] = [];
  resumen = { total_viajes: 0, total_km: 0, total_pagar: 0 };

  ngOnInit(): void {
    this.cargarTransportistas();
  }

  cargarTransportistas() {
    this.transpService.obtenerTransportistas().subscribe({
      next: (res: any) => this.transportistas = Array.isArray(res) ? res : (res?.data || []),
      error: () => this.transportistas = []
    });
  }

  buscar() {
    this.errorMsg = '';
    if (this.filtros.invalid) {
      this.filtros.markAllAsTouched();
      this.errorMsg = 'Complete el rango de fechas.';
      return;
    }
    const { desde, hasta, transportista_id } = this.filtros.value;

    this.loading = true;
    this.reportesService.getPagosTransportista(desde!, hasta!, transportista_id || undefined).subscribe({
      next: (res) => {
        this.detalle = res?.detalle || [];
        this.resumen = res?.resumen || { total_viajes: 0, total_km: 0, total_pagar: 0 };
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = err?.error?.error || 'Error obteniendo el reporte.';
        this.loading = false;
      }
    });
  }
  

  limpiar() {
    const today = new Date().toISOString().substring(0,10);
    this.filtros.reset({ desde: today, hasta: today, transportista_id: '' });
    this.detalle = [];
    this.resumen = { total_viajes: 0, total_km: 0, total_pagar: 0 };
  }

  exportarExcel() {
  const desde = this.filtros.get('desde')?.value || '';
  const hasta = this.filtros.get('hasta')?.value || '';
  const transpId = this.filtros.get('transportista_id')?.value || '';
  const nombreTransp = transpId ? (this.transportistas.find((t:any)=>t._id===transpId)?.nombre || '') : 'Todos';

  const detalleSheet = this.detalle.map((v:any) => ({
    Fecha: v.fecha ? new Date(v.fecha) : null,
    Transportista: v.transportista?.nombre || '',
    Sucursal: v.sucursal?.name || '',
    Colaboradores: v.colaboradores_count ?? (Array.isArray(v.colaboradores) ? v.colaboradores.length : 0),
    KM: v.total_km ?? 0,
    'Tarifa x KM': v.tarifa_por_km ?? 0,
    'Monto viaje': v.monto_viaje ?? 0,
    Observaciones: v.observaciones || ''
  }));

  const resumenSheet = [
    { Campo: 'Desde', Valor: desde },
    { Campo: 'Hasta', Valor: hasta },
    { Campo: 'Transportista', Valor: nombreTransp },
    { Campo: 'Total de viajes', Valor: this.resumen?.total_viajes ?? 0 },
    { Campo: 'Total KM', Valor: this.resumen?.total_km ?? 0 },
    { Campo: 'Total a pagar', Valor: this.resumen?.total_pagar ?? 0 }
  ];

  const wb = XLSX.utils.book_new();
  const ws1 = XLSX.utils.json_to_sheet(resumenSheet, { header: ['Campo','Valor'] });
  const ws2 = XLSX.utils.json_to_sheet(detalleSheet);
  if (detalleSheet.length) {
    const fmt = 'dd/mm/yyyy';
    const dateCol = 0;
    const range = XLSX.utils.decode_range(ws2['!ref'] as string);
    for (let R = range.s.r + 1; R <= range.e.r; ++R) {
      const addr = XLSX.utils.encode_cell({ r: R, c: dateCol });
      const cell = ws2[addr];
      if (cell && cell.v && cell.v instanceof Date) { cell.t = 'd'; cell.z = fmt; }
    }
  }
  XLSX.utils.book_append_sheet(wb, ws1, 'Resumen');
  XLSX.utils.book_append_sheet(wb, ws2, 'Detalle');

  const nombre = `reporte_transportistas_${desde || 'inicio'}_${hasta || 'fin'}${transpId ? '_'+transpId : ''}.xlsx`;
  XLSX.writeFile(wb, nombre);
}

}
