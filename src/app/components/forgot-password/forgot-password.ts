import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ToastrService } from 'ngx-toastr';

type Step = 'email' | 'otp' | 'password' | 'done';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPasswordComponent {

  // ─── State ────────────────────────────────────────────────
  currentStep: Step = 'email';
  isLoading = false;

  // ─── Step 1 ───────────────────────────────────────────────
  email = '';

  // ─── Step 2 ───────────────────────────────────────────────
  otp = '';
  resendCooldown = 0;
  private cooldownTimer: any;

  // ─── Step 3 ───────────────────────────────────────────────
  newPassword = '';
  confirmPassword = '';
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  // ─── Step 1: Send OTP ─────────────────────────────────────

  sendOtp(): void {
    if (!this.email) {
      this.toastr.warning('Please enter your email');
      return;
    }

    this.isLoading = true;

    this.authService.sendPasswordResetOtp(this.email).subscribe({
      next: () => {
        this.toastr.success('OTP sent to your email');
        this.isLoading = false;
        this.currentStep = 'otp';
        this.startResendCooldown();
      },
      error: (err) => {
        const msg = err?.error?.message || 'Email not found. Please check and try again.';
        this.toastr.error(msg, 'Error');
        this.isLoading = false;
      }
    });
  }

  // ─── Step 2: Verify OTP ───────────────────────────────────

  verifyOtp(): void {
  if (!this.otp || this.otp.length !== 6) {
    this.toastr.warning('Please enter the 6-digit OTP');
    return;
  }

  this.authService.verifyOtp(this.email, this.otp).subscribe({
    next: () => {
      this.toastr.success('OTP verified');
      this.currentStep = 'password';
    },
    error: (err) => {
      const msg = err?.error?.message || 'Invalid or expired OTP';
      this.toastr.error(msg);
    }
  });
}

  // ─── Step 3: Reset Password ───────────────────────────────

  resetPassword(): void {
    if (!this.newPassword || !this.confirmPassword) {
      this.toastr.warning('Please fill in both password fields');
      return;
    }
    if (this.newPassword.length < 6) {
      this.toastr.warning('Password must be at least 6 characters');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.toastr.error('Passwords do not match');
      return;
    }

    this.isLoading = true;

    this.authService.resetPassword(this.email, this.newPassword).subscribe({
      next: () => {
        this.isLoading = false;
        this.currentStep = 'done';
      },
      error: (err) => {
        const msg = err?.error?.message || 'Invalid or expired OTP. Please start over.';
        this.toastr.error(msg, 'Reset Failed');
        this.isLoading = false;
        // OTP was wrong — send user back to OTP entry
        this.currentStep = 'otp';
        this.otp = '';
      }
    });
  }

  // ─── Resend OTP ───────────────────────────────────────────

  resendOtp(): void {
    if (this.resendCooldown > 0) return;

    this.authService.sendPasswordResetOtp(this.email).subscribe({
      next: () => {
        this.toastr.success('OTP resent to your email');
        this.startResendCooldown();
      },
      error: () => {
        this.toastr.error('Failed to resend OTP');
      }
    });
  }

  private startResendCooldown(): void {
    this.resendCooldown = 60;
    clearInterval(this.cooldownTimer);
    this.cooldownTimer = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) {
        clearInterval(this.cooldownTimer);
      }
    }, 1000);
  }

  // ─── Helpers ──────────────────────────────────────────────

  goBackToEmail(): void {
    this.currentStep = 'email';
    this.otp = '';
  }

  toggleNewPassword(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  // Step indicator helpers
  get stepNumber(): number {
    const map: Record<Step, number> = { email: 1, otp: 2, password: 3, done: 3 };
    return map[this.currentStep];
  }
}