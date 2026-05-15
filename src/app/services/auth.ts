import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient, private router: Router) {}

  // ─── Register ─────────────────────────────────────────────

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  // ─── Login ────────────────────────────────────────────────

  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data);
  }

  // ─── Logout ───────────────────────────────────────────────

  logout(): void {
    const token = this.getToken();
    if (token) {
      this.http.post(`${this.apiUrl}/logout`, {}, {
        headers: this.getAuthHeaders()
      }).subscribe({ error: () => {} });
    }
    this.clearSession();
    this.router.navigate(['/login']);
  }

  // ─── Forgot Password — Step 1: Send OTP ───────────────────
  // POST /auth/forgot-password/send-otp
  // Body: { email }

  sendPasswordResetOtp(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password/send-otp`, { email });
  }

  // ─── Forgot Password — Step 2: Verify OTP + Reset ─────────
  // POST /auth/forgot-password/reset
  // Body: { email, otp, newPassword }

  resetPassword(email: string, newPassword: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/forgot-password/reset`, {
    email,
    newPassword
  });
}

  verifyOtp(email: string, otp: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/forgot-password/verify-otp`, {
    email,
    otp
  });
}

  // ─── Save Session ─────────────────────────────────────────

  saveSession(response: any): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('userId', response.userId.toString());
    localStorage.setItem('role', response.role);
    localStorage.setItem('fullName', response.fullName);
    localStorage.setItem('email', response.email);
  }

  // ─── Clear Session ────────────────────────────────────────

  clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('fullName');
    localStorage.removeItem('email');
  }

  // ─── Get Token ────────────────────────────────────────────

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // ─── Get UserId ───────────────────────────────────────────

  getUserId(): number {
    return parseInt(localStorage.getItem('userId') || '0');
  }

  // ─── Get Role ─────────────────────────────────────────────

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  // ─── Get FullName ─────────────────────────────────────────

  getFullName(): string | null {
    return localStorage.getItem('fullName');
  }

  // ─── Get Email ────────────────────────────────────────────

  getEmail(): string | null {
    return localStorage.getItem('email');
  }

  // ─── Is Logged In ─────────────────────────────────────────

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // ─── Is Admin ─────────────────────────────────────────────

  isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }

  // ─── Get Auth Headers ─────────────────────────────────────

  getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`
    });
  }

  // ─── Get Profile ──────────────────────────────────────────

  getProfile(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/profile/${this.getUserId()}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // ─── Update Profile ───────────────────────────────────────

  updateProfile(data: any): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/profile/${this.getUserId()}`,
      data,
      { headers: this.getAuthHeaders() }
    );
  }

  // ─── Change Password ──────────────────────────────────────

  changePassword(oldPassword: string,
                 newPassword: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/change-password/${this.getUserId()}`,
      null,
      {
        headers: this.getAuthHeaders(),
        params: { oldPassword, newPassword }
      }
    );
  }

  // ─── Admin — Get All Users ────────────────────────────────

  getAllUsers(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/admin/users`,
      { headers: this.getAuthHeaders() }
    );
  }

  // ─── Admin — Delete User ──────────────────────────────────

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/admin/users/${userId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // ─── Token Expired Check ──────────────────────────────────

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      return Date.now() > expiry;
    } catch (e) {
      return true;
    }
  }
}