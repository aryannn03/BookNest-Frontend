import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  private apiUrl = `${environment.apiUrl}/reviews`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // ─── Get Reviews By Book ──────────────────────────────────

  getByBook(bookId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/book/${bookId}`);
  }

  // ─── Get Average Rating ───────────────────────────────────

  getAvgRating(bookId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/avg-rating/${bookId}`);
  }

  // ─── Get Review Count ─────────────────────────────────────

  getReviewCount(bookId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/count/${bookId}`);
  }

  // ─── Get My Reviews ───────────────────────────────────────

  getMyReviews(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/my-reviews`,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  // ─── Add Review ───────────────────────────────────────────

  addReview(bookId: number, rating: number, comment: string): Observable<any> {
    const fullName = this.authService.getFullName() || 'Anonymous';
    return this.http.post(
        `${this.apiUrl}/add?bookId=${bookId}&rating=${rating}&comment=${encodeURIComponent(comment)}&fullName=${encodeURIComponent(fullName)}`,
        null,
        { headers: this.authService.getAuthHeaders() }
    );
}

  // ─── Update Review ────────────────────────────────────────

  updateReview(reviewId: number, rating: number,
               comment: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/update/${reviewId}?rating=${rating}&comment=${comment}`,
      null,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  // ─── Delete Review ────────────────────────────────────────

  deleteReview(reviewId: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/delete/${reviewId}`,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  // ─── Admin — Get All Reviews ──────────────────────────────

  getAllReviews(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/all`,
      { headers: this.authService.getAuthHeaders() }
    );
  }
}