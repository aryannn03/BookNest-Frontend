import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { NotificationService } from '../../services/notification';
import { Notification } from '../../models/notification';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css'
})
export class NotificationsComponent implements OnInit {

  notifications: Notification[] = [];
  isLoading = true;

  constructor(
    private notificationService: NotificationService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoading = true;
    this.notificationService.getMyNotifications()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (notifications) => {
          // spread before reversing to avoid mutating original array
          this.notifications = [...notifications].reverse();
        },
        error: () => {
          this.toastr.error('Failed to load notifications');
        }
      });
  }

  markAsRead(id: number): void {
    const n = this.notifications.find(
      n => n.notificationId === id);
    if (!n || n.read) return; // skip if already read

    this.notificationService.markAsRead(id).subscribe({
      next: () => { n.read = true; },
      error: () => {
        this.toastr.error('Failed to mark as read');
      }
    });
  }

  markAllRead(): void {
    this.notificationService.markAllRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.read = true);
        this.toastr.success('All marked as read');
      },
      error: () => {
        this.toastr.error('Failed to mark all as read');
      }
    });
  }

  deleteNotification(id: number): void {
    this.notificationService.deleteNotification(id)
      .subscribe({
        next: () => {
          this.notifications = this.notifications.filter(
            n => n.notificationId !== id);
          this.toastr.success('Notification deleted');
        },
        error: () => this.toastr.error('Failed to delete')
      });
  }

  formatType(type: string): string {
    return type?.replace(/_/g, ' ') ?? '';
  }

  getTypeIcon(type: string): string {
    // More specific checks must come before 'ORDER'
    // because ORDER_DISPATCHED / ORDER_DELIVERED also contain 'ORDER'
    if (type?.includes('DISPATCH')) return 'fas fa-truck';
    if (type?.includes('DELIVER'))  return 'fas fa-box-open';
    if (type?.includes('ORDER'))    return 'fas fa-box';
    if (type?.includes('PAYMENT'))  return 'fas fa-wallet';
    if (type?.includes('STOCK'))    return 'fas fa-cubes';
    return 'fas fa-bell';
  }

  getTypeColor(type: string): string {
    if (type?.includes('DISPATCH')) return '#38F9D7';
    if (type?.includes('DELIVER'))  return '#F6C90E';
    if (type?.includes('ORDER'))    return '#6C63FF';
    if (type?.includes('PAYMENT'))  return '#43E97B';
    if (type?.includes('STOCK'))    return '#FF9F43';
    return '#FF6584';
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }
}