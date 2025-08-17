import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { AsignarSucursalesService } from '../../asignar-sucursales.service';
import { FormularioAsignacion } from '../formulario-asignacion/formulario-asignacion';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-asignar-sucursales',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    FormsModule
  ],
  templateUrl: './asignar-sucursales.html',
  styleUrls: ['./asignar-sucursales.scss']
})
export class AsignarSucursales {
   @Input() darkMode = false;
  asignaciones: any[] = [];
  displayedColumns: string[] = ['personal', 'sucursal', 'distancia'];
  asignacionesFiltradas: any[] = [];
  terminoBusqueda: string = '';
  filtroSucursal: string = '';
  filtroDistancia: string = '';
  sucursalesUnicas: string[] = [];
  ordenActual: { campo: string, direccion: 'asc' | 'desc' } = { campo: '', direccion: 'asc' };

  paginaActual: number = 1;
  itemsPorPagina: number = 10;
  totalPaginas: number = 1;
  paginas: number[] = [];

 constructor(
    private dialog: MatDialog,
    private asignarSucursalesService: AsignarSucursalesService
  ) {
    this.setupAsignacionesListener();
    this.cargarAsignaciones();
  }
  private setupAsignacionesListener(): void {
    this.asignarSucursalesService.asignacionesUpdated$.subscribe({
      next: () => {
        this.cargarAsignaciones();
      },
      error: (err) => console.error('Error al suscribirse a actualizaciones de asignaciones:', err)
    });
  }

  abrirModal(): void {
    const dialogRef = this.dialog.open(FormularioAsignacion, {
      width: '600px',
      data: { darkMode: this.darkMode }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result._id) { 
        this.asignaciones.unshift(result);
        this.filtrarAsignaciones();
      }
    });
  }

  cargarAsignaciones(): void {
    this.asignarSucursalesService.getAsignaciones().subscribe({
      next: (data) => {
        this.asignaciones = Array.isArray(data) ? data : [];
        this.asignacionesFiltradas = [...this.asignaciones];
        this.extraerSucursalesUnicas();
        this.actualizarPaginacion();
      },
      error: (error) => {
        console.error('Error al cargar las asignaciones:', error);
        this.asignaciones = [];
        this.asignacionesFiltradas = [];
      }
    });
  }

  extraerSucursalesUnicas(): void {
    const sucursales = this.asignaciones
      .map(a => a.sucursal_id?.name)
      .filter((name, index, self) => name && self.indexOf(name) === index);
    this.sucursalesUnicas = sucursales.sort();
  }

  filtrarAsignaciones(): void {
    this.asignacionesFiltradas = this.asignaciones.filter(asignacion => {
      const coincideBusqueda = !this.terminoBusqueda || 
        (asignacion.personal_id?.nombres?.toLowerCase().includes(this.terminoBusqueda.toLowerCase()) ||
         asignacion.sucursal_id?.name?.toLowerCase().includes(this.terminoBusqueda.toLowerCase()) ||
         asignacion.personal_id?.idEmpleado?.toLowerCase().includes(this.terminoBusqueda.toLowerCase()));
      
      const coincideSucursal = !this.filtroSucursal || 
        asignacion.sucursal_id?.name === this.filtroSucursal;
      
      let coincideDistancia = true;
      if (this.filtroDistancia === 'cercanas') {
        coincideDistancia = asignacion.distancia_km < 10;
      } else if (this.filtroDistancia === 'medias') {
        coincideDistancia = asignacion.distancia_km >= 10 && asignacion.distancia_km <= 30;
      } else if (this.filtroDistancia === 'lejanas') {
        coincideDistancia = asignacion.distancia_km > 30;
      }
      
      return coincideBusqueda && coincideSucursal && coincideDistancia;
    });

    this.paginaActual = 1;
    this.actualizarPaginacion();
  }

  ordenarPor(campo: string): void {
    if (this.ordenActual.campo === campo) {
      this.ordenActual.direccion = this.ordenActual.direccion === 'asc' ? 'desc' : 'asc';
    } else {
      this.ordenActual.campo = campo;
      this.ordenActual.direccion = 'asc';
    }

    this.asignacionesFiltradas.sort((a, b) => {
      const valorA = this.obtenerValorAnidado(a, campo);
      const valorB = this.obtenerValorAnidado(b, campo);

      if (valorA < valorB) return this.ordenActual.direccion === 'asc' ? -1 : 1;
      if (valorA > valorB) return this.ordenActual.direccion === 'asc' ? 1 : -1;
      return 0;
    });

    this.actualizarPaginacion();
  }

  obtenerValorAnidado(objeto: any, ruta: string): any {
    return ruta.split('.').reduce((o, i) => o?.[i], objeto);
  }

  actualizarPaginacion(): void {
    this.totalPaginas = Math.ceil(this.asignacionesFiltradas.length / this.itemsPorPagina);
    this.paginas = Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  get asignacionesPaginadas(): any[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.asignacionesFiltradas.slice(inicio, fin);
  }

  irAPagina(pagina: number): void {
    this.paginaActual = pagina;
  }

  paginaAnterior(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
    }
  }

  paginaSiguiente(): void {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
    }
  }
    exportarAExcel(): void {
    const datosExportar = this.asignacionesFiltradas.map(asignacion => ({
      'Colaborador': asignacion.personal_id?.nombres || 'N/A',
      'ID Empleado': asignacion.personal_id?.idEmpleado || '--',
      'Sucursal': asignacion.sucursal_id?.name || 'N/A',
      'Distancia (km)': asignacion.distancia_km,
    }));
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosExportar);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Asignaciones');
    XLSX.writeFile(wb, `Asignaciones_Sucursales_${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  eliminarAsignacion(id: string): void {
    this.asignarSucursalesService.eliminarAsignacion(id).subscribe({
      next: () => {
        this.cargarAsignaciones();
      },
      error: (err: any) => console.error('Error al eliminar la asignación:', err)
    });
  }
}