import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../../services/book';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory.html',
  styleUrl: './inventory.css'
})
export class InventoryComponent implements OnInit {

  books: any[] = [];
  isLoading = true;
  updatingBook: number | null = null;
  newStockValues: { [key: number]: number } = {};

  constructor(
    private bookService: BookService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.bookService.getAllBooks().subscribe({
      next: (books) => {
        this.books = books;

        books.forEach((b: any) => {
          this.newStockValues[b.bookId] = b.stock;
        });

        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  get inStockCount(): number {
    return this.books.filter(book => book.stock >= 5).length;
  }

  get lowStockCount(): number {
    return this.books.filter(
      book => book.stock > 0 && book.stock < 5
    ).length;
  }

  get outOfStockCount(): number {
    return this.books.filter(book => book.stock === 0).length;
  }

  updateStock(bookId: number): void {
    const quantity = this.newStockValues[bookId];

    if (quantity < 0) {
      this.toastr.warning('Stock cannot be negative');
      return;
    }

    this.updatingBook = bookId;

    this.bookService.updateStock(bookId, quantity).subscribe({
      next: () => {
        const book = this.books.find(
          b => b.bookId === bookId
        );

        if (book) {
          book.stock = quantity;
        }

        this.toastr.success('Stock updated!');
        this.updatingBook = null;
      },
      error: () => {
        this.toastr.error('Failed to update stock');
        this.updatingBook = null;
      }
    });
  }

  getStockStatus(stock: number): string {
    if (stock === 0) return 'out';
    if (stock < 5) return 'low';
    return 'good';
  }
}