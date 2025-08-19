import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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
   listarViajes(params: any) {
    let p = new HttpParams();
    Object.keys(params || {}).forEach(k => {
      const v = params[k];
      if (v !== undefined && v !== null && v !== '') p = p.set(k, v);
    });
    return this.http.get<{items:any[]; total:number; page:number; limit:number}>(`${this.apiUrl}/list`, { params: p });
  }
}