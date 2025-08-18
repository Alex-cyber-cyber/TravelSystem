import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class TransportistasService {
  private apiUrl = `${environment.apiUrl}/transportistas`;

  constructor(private http: HttpClient) { }

  crearTransportista(transportista: any) {
    return this.http.post(this.apiUrl, transportista);
  }

  obtenerTransportistas() {
    return this.http.get(this.apiUrl);
  }
}