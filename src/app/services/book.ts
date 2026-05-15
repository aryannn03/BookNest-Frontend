import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookService {

  private apiUrl = `${environment.apiUrl}/books`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // ─── Get All Books ────────────────────────────────────────

  getAllBooks(): Observable<any> {
    return this.http.get(`${this.apiUrl}/all`);
  }

  // ─── Get Book By ID ───────────────────────────────────────

  getBookById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // ─── Search Books ─────────────────────────────────────────

  searchBooks(keyword: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/search?keyword=${keyword}`);
  }

  // ─── Get By Genre ─────────────────────────────────────────

  getByGenre(genre: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/genre/${genre}`);
  }

  // ─── Get By Author ────────────────────────────────────────

  getByAuthor(author: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/author/${author}`);
  }

  // ─── Get Featured ─────────────────────────────────────────

  getFeatured(): Observable<any> {
    return this.http.get(`${this.apiUrl}/featured`);
  }

  // ─── Get In Stock ─────────────────────────────────────────

  getInStock(): Observable<any> {
    return this.http.get(`${this.apiUrl}/in-stock`);
  }

  // ─── Admin — Add Book ─────────────────────────────────────

  addBook(book: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/add`, book,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  // ─── Admin — Update Book ──────────────────────────────────

  updateBook(book: any): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/update`, book,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  // ─── Admin — Delete Book ──────────────────────────────────

  deleteBook(id: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/delete/${id}`,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  // ─── Admin — Update Stock ─────────────────────────────────

  updateStock(id: number, quantity: number): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/update-stock/${id}?quantity=${quantity}`,
      null,
      { headers: this.authService.getAuthHeaders() }
    );
  }
}