import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/enviroment";
import { Observable } from "rxjs";


interface Sucursal {
    name: string;
  code: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  manager: string;
  state: string;
  active?: boolean;
}



@Injectable ({
    providedIn: 'root'

})

export class SucursalService {
    private apiUrl = `${environment.apiUrl}/sucursales`;

    constructor (private http: HttpClient){}

    crearSucursal(sucursalData: Sucursal): Observable<Sucursal> {
        return this.http.post<Sucursal>(this.apiUrl, sucursalData);
    }
    obtenerSucursales() : Observable<Sucursal[]> {
        return this.http.get<Sucursal[]>(this.apiUrl);
    }
    
    
    
}