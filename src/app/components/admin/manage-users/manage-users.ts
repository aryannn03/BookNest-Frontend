import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manage-users.html',
  styleUrl: './manage-users.css'
})
export class ManageUsersComponent implements OnInit {

  users: any[] = [];
  isLoading = true;
  deletingUser: number | null = null;

  constructor(
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.authService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  deleteUser(userId: number): void {
    if (!confirm('Delete this user?')) return;
    this.deletingUser = userId;
    this.authService.deleteUser(userId).subscribe({
      next: () => {
        this.users = this.users.filter(
          u => u.userId !== userId);
        this.toastr.success('User deleted');
        this.deletingUser = null;
      },
      error: () => {
        this.toastr.error('Failed to delete user');
        this.deletingUser = null;
      }
    });
  }

  getInitial(name: string): string {
    return name?.charAt(0).toUpperCase() || 'U';
  }
}