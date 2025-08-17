import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/enviroment";
import { Observable } from "rxjs";



interface Employee {
  employeeId: string;
  nombres: string;
  email: string;
  telefono: string;
  departamento: string;
  fechaContratacion: string;
  estado: string;
}


@Injectable ({
    providedIn: 'root'
})

export class employeeService {
    private apiUrl = `${environment.apiUrl}/employees`;

    constructor(private http: HttpClient){}

    crearEmployees(employeeData: Employee):Observable<Employee>{
        return this.http.post<Employee>(this.apiUrl, employeeData)
    }
    obtenerEmployees() : Observable<Employee[]>{
        return this.http.get<Employee[]>(this.apiUrl)
    }

}