import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../services/order';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-manage-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-orders.html',
  styleUrl: './manage-orders.css'
})
export class ManageOrdersComponent implements OnInit {

  orders: any[] = [];
  filteredOrders: any[] = [];
  isLoading = true;
  selectedStatus = 'All';
  updatingOrder: number | null = null;

  statuses = [
    'All', 'Placed', 'Confirmed',
    'Dispatched', 'Delivered', 'Cancelled'
  ];

  constructor(
    private orderService: OrderService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.orderService.getAllOrders().subscribe({
      next: (orders) => {
        this.orders = orders.reverse();
        this.filteredOrders = this.orders;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  filterByStatus(status: string): void {
    this.selectedStatus = status;
    this.filteredOrders = status === 'All'
      ? this.orders
      : this.orders.filter(
          o => o.orderStatus === status);
  }

  changeStatus(orderId: number, status: string): void {
    this.updatingOrder = orderId;
    this.orderService.changeStatus(orderId, status)
      .subscribe({
        next: () => {
          const order = this.orders.find(
            o => o.orderId === orderId);
          if (order) order.orderStatus = status;
          this.toastr.success('Status updated!');
          this.updatingOrder = null;
        },
        error: () => {
          this.toastr.error('Failed to update status');
          this.updatingOrder = null;
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