import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../services/book';
import { CartService } from '../../services/cart';
import { WishlistService } from '../../services/wishlist';
import { ReviewService } from '../../services/review';
import { AuthService } from '../../services/auth';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './book-detail.html',
  styleUrl: './book-detail.css'
})
export class BookDetailComponent implements OnInit {

  book: any = null;
  reviews: any[] = [];
  avgRating = 0;
  reviewCount = 0;
  isLoading = true;
  isLoggedIn = false;
  currentUserId = 0;   // ← logged-in user's ID for ownership check
  quantity = 1;

  newReview = {
    rating: 5,
    comment: ''
  };

  selectedRating = 5;
  isSubmittingReview = false;
  isAddingToCart = false;

  constructor(
    private bookService: BookService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private reviewService: ReviewService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();

    // Grab the logged-in user's ID so we can show delete only on own reviews
    if (this.isLoggedIn) {
      this.currentUserId = this.authService.getUserId();
    }

    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.loadBook(id);
      this.loadReviews(id);
    });
  }

  loadBook(id: number): void {
    this.bookService.getBookById(id).subscribe({
      next: (book) => {
        this.book = book;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.router.navigate(['/books']);
      }
    });
  }

  loadReviews(id: number): void {
    this.reviewService.getByBook(id).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        this.reviewCount = reviews.length;
      },
      error: () => {}
    });

    this.reviewService.getAvgRating(id).subscribe({
      next: (res) => {
        this.avgRating = res.averageRating || 0;
      },
      error: () => {}
    });
  }

  addToCart(): void {
    if (!this.isLoggedIn) {
      this.toastr.warning('Please login to add to cart');
      this.router.navigate(['/login']);
      return;
    }
    this.isAddingToCart = true;
    this.cartService.addItem(
        this.book.bookId, this.quantity).subscribe({
      next: () => {
        this.toastr.success(`${this.book.title} added to cart!`);
        this.isAddingToCart = false;
      },
      error: (err) => {
        this.toastr.error(err.error?.error || 'Failed to add to cart');
        this.isAddingToCart = false;
      }
    });
  }

  addToWishlist(): void {
    if (!this.isLoggedIn) {
      this.toastr.warning('Please login to add to wishlist');
      return;
    }
    this.wishlistService.addBook(this.book.bookId).subscribe({
      next: () => this.toastr.success('Added to wishlist!'),
      error: (err) => this.toastr.error(
        err.error?.error || 'Already in wishlist')
    });
  }

  buyNow(): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }
    this.cartService.addItem(
        this.book.bookId, this.quantity).subscribe({
      next: () => this.router.navigate(['/checkout']),
      error: () => this.router.navigate(['/checkout'])
    });
  }

  submitReview(): void {
    if (!this.newReview.comment.trim()) {
      this.toastr.warning('Please write a review comment');
      return;
    }
    this.isSubmittingReview = true;
    this.reviewService.addReview(
      this.book.bookId,
      this.selectedRating,
      this.newReview.comment
    ).subscribe({
      next: () => {
        this.toastr.success('Review submitted successfully!');
        this.newReview = { rating: 5, comment: '' };
        this.selectedRating = 5;
        this.loadReviews(this.book.bookId);
        this.isSubmittingReview = false;
      },
      error: (err) => {
        this.toastr.error(
          err.error?.error || 'Failed to submit review');
        this.isSubmittingReview = false;
      }
    });
  }

  deleteReview(reviewId: number): void {
    this.reviewService.deleteReview(reviewId).subscribe({
      next: () => {
        this.toastr.success('Review deleted');
        // Remove from list instantly without full reload
        this.reviews = this.reviews.filter(
          r => r.reviewId !== reviewId);
        this.reviewCount = this.reviews.length;
        // Refresh avg rating
        this.reviewService.getAvgRating(this.book.bookId).subscribe({
          next: (res) => this.avgRating = res.averageRating || 0,
          error: () => {}
        });
      },
      error: (err) => {
        this.toastr.error(
          err.error?.error || 'Failed to delete review');
      }
    });
  }

  setRating(rating: number): void {
    this.selectedRating = rating;
  }

  getStars(rating: number): number[] {
    return Array(Math.round(rating || 0)).fill(0);
  }

  getEmptyStars(rating: number): number[] {
    return Array(5 - Math.round(rating || 0)).fill(0);
  }

  incrementQty(): void {
    if (this.quantity < this.book.stock) this.quantity++;
  }

  decrementQty(): void {
    if (this.quantity > 1) this.quantity--;
  }

  getRatingPercent(rating: number): number {
    if (!this.reviews.length) return 0;
    const count = this.reviews.filter(
      r => Math.round(r.rating) === rating).length;
    return (count / this.reviews.length) * 100;
  }
}