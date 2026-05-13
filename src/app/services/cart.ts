import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private apiUrl = `${environment.apiUrl}/cart`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // ─── Get My Cart ──────────────────────────────────────────

  getMyCart(): Observable<any> {
    return this.http.get(`${this.apiUrl}/my-cart`,
      { headers: this.authService.getAuthHeaders() });
  }

  // ─── Add Item ─────────────────────────────────────────────

  addItem(bookId: number, quantity: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/add?bookId=${bookId}&quantity=${quantity}`,
      null,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  // ─── Remove Item ──────────────────────────────────────────

  removeItem(itemId: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/remove/${itemId}`,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  // ─── Update Quantity ──────────────────────────────────────

  updateQuantity(itemId: number,
                 quantity: number): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/update/${itemId}?quantity=${quantity}`,
      null,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  // ─── Clear Cart ───────────────────────────────────────────

  clearCart(): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/clear`,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  // ─── Get Total ────────────────────────────────────────────

  getTotal(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/total`,
      { headers: this.authService.getAuthHeaders() }
    );
  }
}