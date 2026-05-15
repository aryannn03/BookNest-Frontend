import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';
import { Notification } from '../models/notification';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private apiUrl = `${environment.apiUrl}/notifications`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // ─── Get My Notifications ─────────────────────────────────

  getMyNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(
      `${this.apiUrl}/my-notifications`,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  // ─── Get Unread Count ─────────────────────────────────────

  getUnreadCount(): Observable<{ unreadCount: number }> {
    return this.http.get<{ unreadCount: number }>(
      `${this.apiUrl}/unread-count`,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  // ─── Mark As Read ─────────────────────────────────────────

  markAsRead(id: number): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      `${this.apiUrl}/mark-read/${id}`, null,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  // ─── Mark All As Read ─────────────────────────────────────

  markAllRead(): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      `${this.apiUrl}/mark-all-read`, null,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  // ─── Delete Notification ──────────────────────────────────

  deleteNotification(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/delete/${id}`,
      { headers: this.authService.getAuthHeaders() }
    );
  }
}