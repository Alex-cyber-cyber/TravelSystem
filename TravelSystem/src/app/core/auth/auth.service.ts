import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/enviroment';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
    isAuthenticated() {
        throw new Error("Method not implemented.");
    }
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUser = new BehaviorSubject<any>(null);


  constructor(private http: HttpClient) {}

    login(email: string, password: string) {
        return this.http.post<{ token: string }>(`${this.apiUrl}/login`, { email, password });
    }

  getCurrentUser(): Observable<any> {
    return this.currentUser.asObservable();
  }
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
  logout(): void {
    localStorage.removeItem('token');
    this.currentUser.next(null);
  }


register(userData: any) {
  return this.http.post(`${environment.apiUrl}/register`, userData); 
}
}