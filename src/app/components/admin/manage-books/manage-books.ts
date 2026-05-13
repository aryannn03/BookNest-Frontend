import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { BookService } from '../../../services/book';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-manage-books',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './manage-books.html',
  styleUrl: './manage-books.css'
})
export class ManageBooksComponent implements OnInit {

  books: any[] = [];
  filteredBooks: any[] = [];
  isLoading = true;
  deletingBook: number | null = null;
  searchKeyword = '';

  constructor(
    private bookService: BookService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBooks();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        if (this.router.url.includes('/admin/books')) {
          this.loadBooks();
        }
      });
  }

  loadBooks(): void {
    this.isLoading = true;

    this.bookService.getAllBooks().subscribe({
      next: (res: any[]) => {
        this.books = res;
        this.filteredBooks = res;
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Failed to load books');
        this.isLoading = false;
      }
    });
  }

  search(keyword: string): void {
    this.filteredBooks = this.books.filter(b =>
      b.title.toLowerCase().includes(keyword.toLowerCase()) ||
      b.author.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  deleteBook(bookId: number): void {
    this.bookService.deleteBook(bookId).subscribe(() => {
      this.loadBooks();
    });
  }
}