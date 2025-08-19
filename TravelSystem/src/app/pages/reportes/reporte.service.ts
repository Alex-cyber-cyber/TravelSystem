import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/enviroment';

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private base = `${environment.apiUrl}/reportes/transportistas`;

  constructor(private http: HttpClient) {}

  getPagosTransportista(desde: string, hasta: string, transportistaId?: string) {
    let params = new HttpParams().set('desde', desde).set('hasta', hasta);
    if (transportistaId) params = params.set('transportista_id', transportistaId);
    return this.http.get<any>(this.base, { params });
  }
}
