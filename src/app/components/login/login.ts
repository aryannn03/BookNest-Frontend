import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {

  loginData = {
    email: '',
    password: ''
  };

  isLoading = false;
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  login(): void {
    if (!this.loginData.email || !this.loginData.password) {
      this.toastr.warning('Please fill all fields');
      return;
    }

    this.isLoading = true;

    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        this.authService.saveSession(response);
        this.toastr.success(
          `Welcome back, ${response.fullName}!`, 'Login Successful');
        this.isLoading = false;

        if (response.role === 'ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: (err) => {
        this.toastr.error('Invalid email or password', 'Login Failed');
        this.isLoading = false;
      }
    });
  }

  loginWithGithub(): void {
    window.location.href =`${environment.apiUrl}/oauth2/authorization/github`;
  }
  loginWithGoogle(): void {
    window.location.href =`${environment.apiUrl}/oauth2/authorization/google`;
}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}