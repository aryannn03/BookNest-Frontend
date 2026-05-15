import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { WalletService } from '../../services/wallet';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {

  // ─── Step control ─────────────────────────────────────────────────────────
  // Step 1: enter email → send OTP
  // Step 2: enter OTP   → verify
  // Step 3: fill form   → register
  currentStep: 1 | 2 | 3 = 1;

  // ─── Form data ────────────────────────────────────────────────────────────
  emailForOtp = '';
  otpValue    = '';

  registerData = {
    fullName:        '',
    email:           '',
    password:        '',
    confirmPassword: '',
    mobile:          null as number | null,
    role:            'CUSTOMER'
  };

  // ─── UI state ─────────────────────────────────────────────────────────────
  isLoading            = false;
  showPassword         = false;
  showConfirmPassword  = false;

  // OTP resend cooldown (seconds)
  resendCooldown  = 0;
  private cooldownTimer: any;

  private readonly API = `${environment.apiUrl}/auth`;

  constructor(
    private authService: AuthService,
    private walletService: WalletService,
    private router: Router,
    private toastr: ToastrService,
    private http: HttpClient
  ) {}

  // ─── Step 1: Send OTP ─────────────────────────────────────────────────────

  sendOtp(): void {
    if (!this.emailForOtp || !this.emailForOtp.includes('@')) {
      this.toastr.warning('Please enter a valid email address');
      return;
    }

    this.isLoading = true;

    this.http.post<any>(`${this.API}/otp/send`, { email: this.emailForOtp })
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          this.registerData.email = this.emailForOtp;
          this.currentStep = 2;
          this.startResendCooldown();
          this.toastr.success(`OTP sent to ${this.emailForOtp}`, 'Check your inbox');
        },
        error: (err) => {
          this.isLoading = false;
          this.toastr.error(err.error?.error || 'Failed to send OTP', 'Error');
        }
      });
  }

  // ─── Step 2: Verify OTP ───────────────────────────────────────────────────

  verifyOtp(): void {
    if (!this.otpValue || this.otpValue.length !== 6) {
      this.toastr.warning('Please enter the 6-digit OTP');
      return;
    }

    this.isLoading = true;

    this.http.post<any>(`${this.API}/otp/verify`, {
      email: this.emailForOtp,
      otp:   this.otpValue
    }).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.verified) {
          this.currentStep = 3;
          this.toastr.success('Email verified! Complete your registration.', 'Verified ✓');
        } else {
          this.toastr.error('Invalid or expired OTP', 'Error');
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.toastr.error(err.error?.error || err.error?.message || 'OTP verification failed', 'Error');
      }
    });
  }

  // ─── Resend OTP ───────────────────────────────────────────────────────────

  resendOtp(): void {
    if (this.resendCooldown > 0) return;
    this.otpValue = '';
    this.sendOtp();
  }

  private startResendCooldown(seconds = 60): void {
    this.resendCooldown = seconds;
    clearInterval(this.cooldownTimer);
    this.cooldownTimer = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) {
        clearInterval(this.cooldownTimer);
      }
    }, 1000);
  }

  // ─── Step 3: Register ─────────────────────────────────────────────────────

  register(): void {
    if (!this.registerData.fullName ||
        !this.registerData.email ||
        !this.registerData.password) {
      this.toastr.warning('Please fill all required fields');
      return;
    }

    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.toastr.error('Passwords do not match');
      return;
    }

    if (this.registerData.password.length < 6) {
      this.toastr.error('Password must be at least 6 characters');
      return;
    }

    this.isLoading = true;

    const payload = {
      fullName: this.registerData.fullName,
      email:    this.registerData.email,
      password: this.registerData.password,
      mobile:   this.registerData.mobile,
      role:     'CUSTOMER'
    };

    this.authService.register(payload).subscribe({
      next: (response) => {
        this.authService.saveSession(response);

        this.walletService.createWallet().subscribe({
          next: () => {},
          error: () => {}
        });

        this.toastr.success(
          `Welcome to BookNest, ${response.fullName}!`,
          'Registration Successful'
        );
        this.isLoading = false;
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.toastr.error(err.error?.error || 'Registration failed', 'Error');
        this.isLoading = false;
      }
    });
  }

  // ─── OTP digit input helper ───────────────────────────────────────────────

  onOtpInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    // Allow digits only
    input.value = input.value.replace(/\D/g, '').slice(0, 6);
    this.otpValue = input.value;
  }

  // ─── Misc helpers ─────────────────────────────────────────────────────────

  goBackToEmail(): void {
    this.currentStep = 1;
    this.otpValue    = '';
    clearInterval(this.cooldownTimer);
    this.resendCooldown = 0;
  }

  togglePassword(): void        { this.showPassword        = !this.showPassword; }
  toggleConfirmPassword(): void { this.showConfirmPassword = !this.showConfirmPassword; }

  loginWithGithub(): void {
    window.location.href =`${environment.apiUrl}/oauth2/authorization/github`;
  }
  loginWithGoogle(): void {
  window.location.href =`${environment.apiUrl}/oauth2/authorization/google`;
}
}