import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../services/book';
import { CartService } from '../../services/cart';
import { WishlistService } from '../../services/wishlist';
import { AuthService } from '../../services/auth';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-books',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './books.html',
  styleUrl: './books.css'
})
export class BooksComponent implements OnInit {

  books: any[] = [];
  filteredBooks: any[] = [];
  isLoading = true;
  isLoggedIn = false;
  selectedGenre = '';
  sortBy = 'default';
  searchKeyword = '';
  priceRange = 1000;
  viewMode = 'grid';

  genres = [
  'All',
  'Fiction',
  'Non-Fiction',
  'Programming',
  'Science',
  'History',
  'Biography',
  'Self-Help',
  'Fantasy',
  'Mystery',
  'Romance',
  'Thriller',
  'Children'
];

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
      if (params['genre']) {
        this.selectedGenre = params['genre'];
        this.loadByGenre(params['genre']);
      } else {
        this.loadAllBooks();
      }
    });
  }

  loadAllBooks(): void {
    this.isLoading = true;
    this.bookService.getAllBooks().subscribe({
      next: (books) => {
        this.books = books;
        this.filteredBooks = books;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  loadByGenre(genre: string): void {
    this.isLoading = true;
    this.bookService.getByGenre(genre).subscribe({
      next: (books) => {
        this.books = books;
        this.filteredBooks = books;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  filterByGenre(genre: string): void {
    this.selectedGenre = genre;
    if (genre === 'All' || genre === '') {
      this.filteredBooks = this.books;
    } else {
      this.filteredBooks = this.books.filter(b =>
        b.genre?.toLowerCase() === genre.toLowerCase());
    }
    this.applySort();
  }

  applySort(): void {
    let sorted = [...this.filteredBooks];
    switch (this.sortBy) {
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price); break;
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price); break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating); break;
      case 'title':
        sorted.sort((a, b) =>
          a.title.localeCompare(b.title)); break;
    }
    this.filteredBooks = sorted;
  }

  filterByPrice(): void {
    this.filteredBooks = this.books.filter(
      b => b.price <= this.priceRange);
    this.applySort();
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
      this.toastr.warning('Please login to add to wishlist');
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