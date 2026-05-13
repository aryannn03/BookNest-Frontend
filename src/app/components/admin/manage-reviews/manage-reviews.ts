import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewService } from '../../../services/review';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-manage-reviews',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manage-reviews.html',
  styleUrl: './manage-reviews.css'
})
export class ManageReviewsComponent implements OnInit {

  reviews: any[] = [];
  isLoading = true;
  deletingReview: number | null = null;

  constructor(
    private reviewService: ReviewService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.reviewService.getAllReviews().subscribe({
      next: (reviews) => {
        this.reviews = reviews.reverse();
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  deleteReview(reviewId: number): void {
    if (!confirm('Delete this review?')) return;
    this.deletingReview = reviewId;
    this.reviewService.deleteReview(reviewId).subscribe({
      next: () => {
        this.reviews = this.reviews.filter(
          r => r.reviewId !== reviewId);
        this.toastr.success('Review deleted');
        this.deletingReview = null;
      },
      error: () => {
        this.toastr.error('Failed to delete review');
        this.deletingReview = null;
      }
    });
  }

  getStars(rating: number): number[] {
    return Array(Math.round(rating || 0)).fill(0);
  }
}