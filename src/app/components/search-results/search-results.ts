import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { BookService } from '../../services/book';
import { CartService } from '../../services/cart';
import { WishlistService } from '../../services/wishlist';
import { AuthService } from '../../services/auth';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './search-results.html',
  styleUrl: './search-results.css'
})
export class SearchResultsComponent implements OnInit {

  books: any[] = [];
  keyword = '';
  isLoading = true;
  isLoggedIn = false;

  constructor(
    private bookService: BookService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.route.queryParams.subscribe(params => {
      this.keyword = params['keyword'] || '';
      if (this.keyword) {
        this.searchBooks();
      }
    });
  }

  searchBooks(): void {
    this.isLoading = true;
    this.bookService.searchBooks(this.keyword).subscribe({
      next: (books) => {
        this.books = books;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  addToCart(bookId: number, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.isLoggedIn) {
      this.toastr.warning('Please login to add to cart');
      return;
    }
    this.cartService.addItem(bookId, 1).subscribe({
      next: () => this.toastr.success('Added to cart!'),
      error: (err) => this.toastr.error(
        err.error?.error || 'Failed to add to cart')
    });
  }

  addToWishlist(bookId: number, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.isLoggedIn) {
      this.toastr.warning('Please login first');
      return;
    }
    this.wishlistService.addBook(bookId).subscribe({
      next: () => this.toastr.success('Added to wishlist!'),
      error: (err) => this.toastr.error(
        err.error?.error || 'Already in wishlist')
    });
  }

  getStars(rating: number): number[] {
    return Array(Math.round(rating || 0)).fill(0);
  }

  getEmptyStars(rating: number): number[] {
    return Array(5 - Math.round(rating || 0)).fill(0);
  }
}