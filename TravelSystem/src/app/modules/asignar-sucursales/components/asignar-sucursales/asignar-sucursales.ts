import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { AsignarSucursalesService } from '../../asignar-sucursales.service';
import { FormularioAsignacion } from '../formulario-asignacion/formulario-asignacion';

@Component({
  selector: 'app-asignar-sucursales',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule
  ],
  templateUrl: './asignar-sucursales.html',
  styleUrls: ['./asignar-sucursales.scss']
})
export class AsignarSucursales {
   @Input() darkMode = false;
  asignaciones: any[] = [];
  displayedColumns: string[] = ['personal', 'sucursal', 'distancia'];

  constructor(
    private dialog: MatDialog,
    private asignarSucursalesService: AsignarSucursalesService
  ) {
    this.cargarAsignaciones();
  }

  abrirModal(): void {
    const dialogRef = this.dialog.open(FormularioAsignacion, {
      width: '600px',
      panelClass: this.darkMode ? 'dark-theme' : '',
      data: { darkMode: this.darkMode },
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result === 'success'){
        this.cargarAsignaciones();
      }
    });
  }

  cargarAsignaciones(): void {
    this.asignarSucursalesService.getAsignaciones().subscribe({
      next: (data) => {
        this.asignaciones = Array.isArray(data) ? data : [];
      },
      error: (error) => {
        console.error('Error al cargar las asignaciones:', error);
        this.asignaciones = [];
      }
    });
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