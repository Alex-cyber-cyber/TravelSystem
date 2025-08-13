import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/enviroment';
import { BehaviorSubject, Observable, tap } from 'rxjs';


interface User {
  id: string;
  employeeId: string;
  nombres: string;
  correo: string;
  role?: string; 
}
@Injectable({ providedIn: 'root' })
export class AuthService {
    isAuthenticated() {
        throw new Error("Method not implemented.");
    }
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const token = localStorage.getItem('token');
    if (token) {
     this.fetchUserData().subscribe();
    }
  }

login(email: string, password: string): Observable<{ token: string, user: User }> {
    return this.http.post<{ token: string, user: User }>(`${this.apiUrl}/login`, { 
      email, 
      password 
    }).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        const userData = {
          ...response.user,
          name: response.user.nombres, 
          email: response.user.correo  
        };
        this.currentUserSubject.next(userData);
      })
    );
  }

  private fetchUserData(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
      })
    );
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }


register(userData: any) {
  return this.http.post(`${environment.apiUrl}/register`, userData); 
}
}