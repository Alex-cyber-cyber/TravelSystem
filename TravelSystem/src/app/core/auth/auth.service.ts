import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/enviroment'; 
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode'; 

interface User {
  id: string;
  employeeId: string;
  nombres: string;
  correo: string;
  role: string; 
  departamento?: string;
}

interface DecodedToken {
  exp: number;
  iat: number;
  sub: string;
  role?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  isLoggedIn() {
      throw new Error("Method not implemented.");
  }
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('currentUser');

    if (token && this.isTokenValid(token) && userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
      } catch (e) {
        console.error('Error parsing user data', e);
        this.clearStorage();
      }
    } else {
      this.clearStorage();
    }
  }

  private isTokenValid(token: string): boolean {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (e) {
      console.error('Error decoding token', e);
      return false;
    }
  }

  login(email: string, password: string): Observable<{ token: string; user: User }> {
    return this.http.post<{ token: string; user: User }>(
      `${this.apiUrl}/login`,
      { email, password }
    ).pipe(
      tap(response => {
        this.storeAuthData(response.token, response.user);
      }),
      catchError(error => {
        this.clearStorage();
        return throwError(() => error);
      })
    );
  }

  private storeAuthData(token: string, user: User): void {
    localStorage.setItem('token', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  fetchUserData(): Observable<User> {
    const token = localStorage.getItem('token');
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap(user => { if (token) this.storeAuthData(token, user); }),
      catchError(error => {
        if (error.status === 401) this.logout();
        return throwError(() => error);
      })
    );
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token && this.isTokenValid(token);
  }

  logout(): void {
    this.clearStorage();
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  private clearStorage(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  checkAuth(): Observable<boolean> {
    const token = localStorage.getItem('token');
    
    if (!token || !this.isTokenValid(token)) {
      this.logout();
      return new Observable(observer => {
        observer.next(false);
        observer.complete();
      });
    }

    return this.fetchUserData().pipe(
      map(user => !!user),
      catchError(() => {
        this.logout();
        return new Observable<boolean>(observer => {
          observer.next(false);
          observer.complete();
        });
      })
    );
  }


  hasRole(requiredRole: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === requiredRole;
  }

  getDecodedToken(): DecodedToken | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      return jwtDecode<DecodedToken>(token);
    } catch (e) {
      console.error('Error decoding token', e);
      return null;
    }
  }

  hasTripPermission(user: Partial<User> | null, decoded?: any): boolean {
  const role = (user?.role ?? decoded?.role ?? '').toString().toLowerCase();
  const dept = (user?.departamento ?? decoded?.departamento ?? '').toString().toLowerCase();
  return role === 'admin' || (role === 'gerente' && dept === 'tienda');
}

}