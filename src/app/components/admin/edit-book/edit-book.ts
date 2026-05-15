import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute }
  from '@angular/router';
import { BookService } from '../../../services/book';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-edit-book',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './edit-book.html',
  styleUrl: './edit-book.css'
})
export class EditBookComponent implements OnInit {

  bookForm: any = {
    bookId: null,
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

  isLoading = true;
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
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.params['id'];
    this.bookService.getBookById(id).subscribe({
      next: (book) => {
        this.bookForm = { ...book };
        this.isLoading = false;
      },
      error: () => {
        this.router.navigate(['/admin/books']);
      }
    });
  }

  updateBook(): void {
    if (!this.bookForm.title || !this.bookForm.author) {
      this.toastr.warning('Please fill required fields');
      return;
    }
    this.isSubmitting = true;
    this.bookService.updateBook(this.bookForm).subscribe({
      next: () => {
        this.toastr.success('Book updated successfully!');
        this.router.navigate(['/admin/books']);
      },
      error: () => {
        this.toastr.error('Failed to update book');
        this.isSubmitting = false;
      }
    });
  }
}