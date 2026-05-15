import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../services/wishlist';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.css'
})
export class WishlistComponent implements OnInit {

  wishlist: any = null;
  isLoading = true;
  movingItem: number | null = null;
  removingItem: number | null = null;

  constructor(
    private wishlistService: WishlistService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadWishlist();
  }

  loadWishlist(): void {
    this.isLoading = true;
    this.wishlistService.getMyWishlist().subscribe({
      next: (wishlist) => {
        this.wishlist = wishlist;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  removeBook(itemId: number): void {
    this.removingItem = itemId;
    this.wishlistService.removeBook(itemId).subscribe({
      next: (wishlist) => {
        this.wishlist = wishlist;
        this.removingItem = null;
        this.toastr.success('Removed from wishlist');
      },
      error: () => {
        this.toastr.error('Failed to remove');
        this.removingItem = null;
      }
    });
  }

  moveToCart(itemId: number): void {
    this.movingItem = itemId;
    this.wishlistService.moveToCart(itemId).subscribe({
      next: () => {
        this.toastr.success('Moved to cart!');
        this.loadWishlist();
        this.movingItem = null;
      },
      error: (err) => {
        this.toastr.error(
          err.error?.error || 'Failed to move to cart');
        this.movingItem = null;
      }
    });
  }

  clearWishlist(): void {
    this.wishlistService.clearWishlist().subscribe({
      next: () => {
        this.loadWishlist();
        this.toastr.success('Wishlist cleared');
      },
      error: () => this.toastr.error(
        'Failed to clear wishlist')
    });
  }
}