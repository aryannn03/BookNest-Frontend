import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent implements OnInit {

  profile: any = null;
  isLoading = true;
  isUpdating = false;
  isChangingPassword = false;
  activeTab = 'profile';

  profileForm = {
    fullName: '',
    mobile: null
  };

  passwordForm = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.authService.getProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.profileForm.fullName = profile.fullName;
        this.profileForm.mobile = profile.mobile;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  updateProfile(): void {
    this.isUpdating = true;
    this.authService.updateProfile(this.profileForm)
      .subscribe({
        next: (profile) => {
          this.profile = profile;
          localStorage.setItem('fullName', profile.fullName);
          this.toastr.success('Profile updated!');
          this.isUpdating = false;
        },
        error: () => {
          this.toastr.error('Failed to update profile');
          this.isUpdating = false;
        }
      });
  }

  changePassword(): void {
    if (this.passwordForm.newPassword !==
        this.passwordForm.confirmPassword) {
      this.toastr.error('Passwords do not match');
      return;
    }
    if (this.passwordForm.newPassword.length < 6) {
      this.toastr.error(
        'Password must be at least 6 characters');
      return;
    }

    this.isChangingPassword = true;
    this.authService.changePassword(
      this.passwordForm.oldPassword,
      this.passwordForm.newPassword
    ).subscribe({
      next: () => {
        this.toastr.success('Password changed successfully!');
        this.passwordForm = {
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
        this.isChangingPassword = false;
      },
      error: (err) => {
        this.toastr.error(
          err.error?.error || 'Failed to change password');
        this.isChangingPassword = false;
      }
    });
  }

  getInitial(): string {
    return this.profile?.fullName?.charAt(0)
      .toUpperCase() || 'U';
  }
}