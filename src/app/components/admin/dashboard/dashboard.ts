import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookService } from '../../../services/book';
import { OrderService } from '../../../services/order';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {

  totalBooks = 0;
  totalOrders = 0;
  totalUsers = 0;
  totalRevenue = 0;
  recentOrders: any[] = [];
  isLoading = true;

  orderStatuses = [
    { status: 'Placed', count: 0, color: '#F6C90E' },
    { status: 'Confirmed', count: 0, color: '#6C63FF' },
    { status: 'Dispatched', count: 0, color: '#38F9D7' },
    { status: 'Delivered', count: 0, color: '#43E97B' },
    { status: 'Cancelled', count: 0, color: '#FF6584' }
  ];

  constructor(
    private bookService: BookService,
    private orderService: OrderService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.bookService.getAllBooks().subscribe({
      next: (books) => {
        this.totalBooks = books.length;
      }
    });

    this.orderService.getAllOrders().subscribe({
      next: (orders) => {
        this.totalOrders = orders.length;
        this.recentOrders = orders.slice(-5).reverse();
        this.totalRevenue = orders
          .filter((o: any) => o.orderStatus === 'Delivered')
          .reduce((sum: number, o: any) => sum + o.amountPaid, 0);
        this.orderStatuses.forEach(s => {
          s.count = orders.filter(
            (o: any) => o.orderStatus === s.status).length;
        });
        this.isLoading = false;
      }
    });

    this.authService.getAllUsers().subscribe({
      next: (users) => {
        this.totalUsers = users.length;
      }
    });
  }

  getStatusClass(status: string): string {
    const map: any = {
      'Placed': 'status-placed',
      'Confirmed': 'status-confirmed',
      'Dispatched': 'status-dispatched',
      'Delivered': 'status-delivered',
      'Cancelled': 'status-cancelled'
    };
    return map[status] || '';
  }
}