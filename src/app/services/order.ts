import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // ─── Get My Orders ────────────────────────────────────────

  getMyOrders(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/my-orders`,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  // ─── Get Order By ID ──────────────────────────────────────

  getOrderById(id: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/${id}`,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  // ─── Place COD Order ──────────────────────────────────────
  // bookId & quantity removed — backend fetches from cart

  placeCOD(addressId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/place-cod?addressId=${addressId}`,
      null,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  // ─── Place Wallet Order ───────────────────────────────────
  // bookId & quantity removed — backend fetches from cart

  placeWallet(addressId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/place-online?addressId=${addressId}`,
      null,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  // ─── Create Razorpay Order ────────────────────────────────
  // bookId & quantity removed — backend fetches from cart and sums total

  createRazorpayOrder(addressId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/razorpay/create-order`,
      { addressId },
      { headers: this.authService.getAuthHeaders() }
    );
  }

  // ─── Verify Razorpay Payment ──────────────────────────────

  verifyRazorpayPayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
    addressId: number
  ): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/razorpay/verify`,
      {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        addressId
        // bookId and quantity removed — backend reads cart
      },
      { headers: this.authService.getAuthHeaders() }
    );
  }

  // ─── Cancel Order ─────────────────────────────────────────

  cancelOrder(orderId: number): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/cancel/${orderId}`,
      null,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  // ─── Save Address ─────────────────────────────────────────

  saveAddress(address: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/address/save`,
      address,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  // ─── Get My Addresses ─────────────────────────────────────
  
  getMyAddresses(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/address/my-addresses`,
      { headers: this.authService.getAuthHeaders() }
    );
  }
  
  // ─── Delete My Addresses ─────────────────────────────────────
  deleteAddress(addressId: number): Observable<any> {
  return this.http.delete(
    `${this.apiUrl}/address/${addressId}`,
    { headers: this.authService.getAuthHeaders() }
  );
}

  // ─── Admin — Get All Orders ───────────────────────────────

  getAllOrders(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/all`,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  // ─── Admin — Change Status ────────────────────────────────

  changeStatus(orderId: number, status: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/status/${orderId}?status=${status}`,
      null,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  // ─── Admin — Delete Order ─────────────────────────────────

  deleteOrder(orderId: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/delete/${orderId}`,
      { headers: this.authService.getAuthHeaders() }
    );
  }
}