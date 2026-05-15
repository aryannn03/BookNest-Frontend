import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BookService } from '../../../services/book';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-book',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './add-book.html',
  styleUrl: './add-book.css'
})
export class AddBookComponent {

  bookForm = {
    title: '',
    author: '',
    isbn: '',
    genre: '',
    publisher: '',
    price: null,
    stock: null,
    description: '',
    coverImageUrl: '',
    publishedDate: '',
    featured: false
  };

  isSubmitting = false;

  genres = [
    'Fiction', 'Non-Fiction', 'Programming',
    'Science', 'History', 'Biography',
    'Self-Help', 'Fantasy', 'Mystery',
    'Romance', 'Thriller', 'Children'
  ];

  constructor(
    private bookService: BookService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  addBook(): void {
    if (!this.bookForm.title ||
        !this.bookForm.author ||
        !this.bookForm.price) {
      this.toastr.warning('Please fill required fields');
      return;
    }

    this.isSubmitting = true;
    this.bookService.addBook(this.bookForm).subscribe({
      next: () => {
        this.toastr.success('Book added successfully!');
        this.router.navigate(['/admin/books']);
      },
      error: (err) => {
        this.toastr.error(
          err.error?.error || 'Failed to add book');
        this.isSubmitting = false;
      }
    });
  }
}