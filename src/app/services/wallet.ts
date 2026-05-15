import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WalletService {

  private apiUrl = `${environment.apiUrl}/wallet`;
  private orderUrl = `${environment.apiUrl}/orders`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // ─── Create Wallet ────────────────────────────────────────

  createWallet(): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/create`, null,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  // ─── Get My Wallet ────────────────────────────────────────

  getMyWallet(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/my-wallet`,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  // ─── Add Money ────────────────────────────────────────────

  addMoney(amount: number, remarks: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/add-money?amount=${amount}&remarks=${remarks}`,
      null,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  // ─── Get Statements ───────────────────────────────────────

  getStatements(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/my-statements`,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  // ─── Admin — Get All Wallets ──────────────────────────────

  getAllWallets(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/all`,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  // ─── Razorpay — Step 1: Create Order ─────────────────────

  createRazorpayOrder(bookId: number, quantity: number, addressId: number): Observable<any> {
    return this.http.post(
      `${this.orderUrl}/razorpay/create-order`,
      { bookId, quantity, addressId },
      { headers: this.authService.getAuthHeaders() }
    );
  }

  // ─── Razorpay — Step 2: Verify & Place Order ─────────────

  verifyPayment(data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    bookId: number;
    quantity: number;
    addressId: number;
    amount: number;
  }): Observable<any> {
    return this.http.post(
      `${this.orderUrl}/razorpay/verify`,
      data,
      { headers: this.authService.getAuthHeaders() }
    );
  }
}