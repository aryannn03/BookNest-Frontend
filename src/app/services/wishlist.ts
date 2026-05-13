import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {

  private apiUrl = `${environment.apiUrl}/wishlist`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // ─── Get My Wishlist ──────────────────────────────────────

  getMyWishlist(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/my-wishlist`,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  // ─── Add Book ─────────────────────────────────────────────

  addBook(bookId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/add/${bookId}`, null,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  // ─── Remove Book ──────────────────────────────────────────

  removeBook(itemId: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/remove/${itemId}`,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  // ─── Move To Cart ─────────────────────────────────────────

  moveToCart(itemId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/move-to-cart/${itemId}`, null,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  // ─── Clear Wishlist ───────────────────────────────────────

  clearWishlist(): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/clear`,
      { headers: this.authService.getAuthHeaders() }
    );
  }
}