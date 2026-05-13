import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { BookService } from '../../services/book';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {

  featuredBooks: any[] = [];
  recentBooks: any[] = [];
  isLoggedIn = false;
  isLoading = true;

  genres = [
    { name: 'Fiction', icon: 'fas fa-feather',
      color: '#6C63FF' },
    { name: 'Programming', icon: 'fas fa-code',
      color: '#43E97B' },
    { name: 'Science', icon: 'fas fa-flask',
      color: '#38F9D7' },
    { name: 'History', icon: 'fas fa-landmark',
      color: '#FF6584' },
    { name: 'Biography', icon: 'fas fa-user',
      color: '#F6C90E' },
    { name: 'Self-Help', icon: 'fas fa-star',
      color: '#FF9F43' }
  ];

  stats = [
    { value: '10K+', label: 'Books Available',
      icon: 'fas fa-book' },
    { value: '5K+', label: 'Happy Readers',
      icon: 'fas fa-users' },
    { value: '50+', label: 'Genres',
      icon: 'fas fa-tags' },
    { value: '24/7', label: 'Support',
      icon: 'fas fa-headset' }
  ];

  constructor(
    private bookService: BookService,
    private authService: AuthService,
    public router: Router
) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.loadFeaturedBooks();
    this.loadRecentBooks();
  }

  loadFeaturedBooks(): void {
    this.bookService.getFeatured().subscribe({
      next: (books) => {
        this.featuredBooks = books.slice(0, 6);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  loadRecentBooks(): void {
    this.bookService.getAllBooks().subscribe({
      next: (books) => {
        this.recentBooks = books.slice(0, 8);
      },
      error: () => {}
    });
  }

  getStars(rating: number): number[] {
    return Array(Math.round(rating)).fill(0);
  }

  getEmptyStars(rating: number): number[] {
    return Array(5 - Math.round(rating)).fill(0);
  }
}