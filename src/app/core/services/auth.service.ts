import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';

interface LoginResponse {
  user: {
    id: number;
    name: string;
    email: string;
    is_admin?: boolean;
  };
  token: string;
  token_type: string;
  expires_in: number;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<UserData | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Try to restore user from token on app init
    this.restoreUserFromToken();
  }

  private restoreUserFromToken() {
    const token = localStorage.getItem('token');
    if (token) {
      // Decode JWT token to get user data
      try {
        const payload = this.decodeToken(token);
        if (payload && payload.exp * 1000 > Date.now()) {
          // Token is still valid
          this.currentUserSubject.next({
            id: payload.sub || payload.user_id,
            name: payload.name || '',
            email: payload.email || '',
            is_admin: payload.is_admin || false
          });
        } else {
          // Token expired
          this.logout();
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        this.logout();
      }
    }
  }

  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  }

  private setCurrentUser(user: UserData) {
    this.currentUserSubject.next(user);
  }

  public get currentUserValue(): UserData | null {
    return this.currentUserSubject.value;
  }

  register(payload: any) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/register`, payload).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          this.setCurrentUser({
            id: response.user.id,
            name: response.user.name,
            email: response.user.email,
            is_admin: response.user.is_admin || false
          });
          console.log('Registration successful, user data stored');
        }
      })
    );
  }

  login(email: string, password: string) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, {
      email,
      password
    }).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        this.setCurrentUser({
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          is_admin: response.user.is_admin || false
        });
        console.log('Login successful, user data stored');
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    console.log('Logout successful, user data cleared');
  }

  getToken(): string | null {
    const token = localStorage.getItem('token');
    return token;
  }

  getUserId(): number | null {
    return this.currentUserValue?.id || null;
  }

  getUserName(): string | null {
    return this.currentUserValue?.name || null;
  }

  getUserEmail(): string | null {
    return this.currentUserValue?.email || null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.currentUserValue;
  }

  isAdmin(): boolean {
    return this.currentUserValue?.is_admin === true;
  }
}
