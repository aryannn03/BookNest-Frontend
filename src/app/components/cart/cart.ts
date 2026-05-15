import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class CartComponent implements OnInit {

  cart: any = null;
  isLoading = true;
  updatingItem: number | null = null;

  constructor(
    private cartService: CartService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.isLoading = true;
    this.cartService.getMyCart().subscribe({
      next: (cart) => {
        this.cart = cart;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  updateQuantity(itemId: number, quantity: number): void {
    if (quantity < 1) return;
    this.updatingItem = itemId;
    this.cartService.updateQuantity(itemId, quantity).subscribe({
      next: (cart) => {
        this.cart = cart;
        this.updatingItem = null;
      },
      error: (err) => {
        this.toastr.error(
          err.error?.error || 'Failed to update quantity');
        this.updatingItem = null;
      }
    });
  }

  removeItem(itemId: number): void {
    this.updatingItem = itemId;
    this.cartService.removeItem(itemId).subscribe({
      next: (cart) => {
        this.cart = cart;
        this.updatingItem = null;
        this.toastr.success('Item removed from cart');
      },
      error: () => {
        this.toastr.error('Failed to remove item');
        this.updatingItem = null;
      }
    });
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe({
      next: () => {
        this.loadCart();
        this.toastr.success('Cart cleared');
      },
      error: () => this.toastr.error('Failed to clear cart')
    });
  }
}