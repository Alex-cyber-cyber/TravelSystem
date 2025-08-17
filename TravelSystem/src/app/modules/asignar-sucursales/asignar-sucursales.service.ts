import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { catchError, map, Observable, of, retry, tap, throwError } from "rxjs";
import { environment } from "../../../environments/enviroment";

@Injectable({
  providedIn: "root"
})
export class AsignarSucursalesService {
  buscarEmpleados(term: string): any {
    throw new Error('Method not implemented.');
  }
  buscarSucursales(term: string): any {
    throw new Error('Method not implemented.');
  }
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

obtenerEmployees(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/employees`).pipe(
      retry(2), 
      tap({
        next: data => console.log('Datos recibidos:', data),
        error: err => console.error('Error en la solicitud:', err)
      }),
      catchError(error => {
        console.error('Error en obtenerEmployees:', error);
        return of([]); 
      })
    );
  }

    obtenerSucursales(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sucursales`).pipe(
        tap(data => console.log('Datos de sucursales recibidos:', data)), 
        catchError(error => {
        console.error('Error al obtener sucursales:', error);
        return of([]); 
        })
    );
    }

  crearAsignacion(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/AsignarSucursales`, data)
    .pipe(catchError(error => {
      console.error('Error al crear asignación:', error);
      return throwError(error);
    }));
  }

  getAsignaciones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/AsignarSucursales/AsignarSucursales`)
    .pipe(catchError(() => of ([])));
  }


  eliminarAsignacion(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/AsignarSucursales/AsignarSucursales/${id}`)
    .pipe(catchError(error => {
      console.error('Error al eliminar asignación:', error);
      return throwError(error);
    }));
  }
}