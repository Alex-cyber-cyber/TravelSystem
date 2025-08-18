import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class ViajesService {
  private apiUrl = `${environment.apiUrl}/viajes`;

  constructor(private http: HttpClient) { }

  crearViaje(viajeData: any) {
    return this.http.post(this.apiUrl, viajeData);
  }

  getViajesPorFecha(fecha: string) {
    return this.http.get(`${this.apiUrl}?fecha=${fecha}`);
  }
}