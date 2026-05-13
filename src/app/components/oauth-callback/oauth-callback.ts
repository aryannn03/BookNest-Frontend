import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-oauth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="display:flex; justify-content:center;
                align-items:center; height:100vh;
                background:#0f0f23; color:white;
                flex-direction:column; gap:16px;">
      <i class="fas fa-spinner fa-spin"
         style="font-size:2rem; color:#6C63FF"></i>
      <p style="font-size:1rem; color:#aaa">
        Completing sign in...
      </p>
    </div>
  `
})
export class OAuthCallbackComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
  const token = this.route.snapshot.queryParamMap.get('token');

  if (!token) {
    this.toastr.error('OAuth login failed', 'Error');
    this.router.navigate(['/login']);
    return;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));

    // Save token, userId, role first
    localStorage.setItem('token', token);
    localStorage.setItem('userId', payload.userId ?? '');
    localStorage.setItem('role', payload.role ?? 'CUSTOMER');

    // Now fetch full profile to get name & email
    this.authService.getProfile().subscribe({
      next: (user) => {
        localStorage.setItem('fullName', user.fullName ?? '');
        localStorage.setItem('email', user.email ?? '');

        this.toastr.success(`Welcome, ${user.fullName}!`, 'Login Successful');

        if (payload.role === 'ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: () => {
        this.toastr.error('Could not load profile', 'Error');
        this.router.navigate(['/login']);
      }
    });

  } catch (e) {
    this.toastr.error('Invalid session token', 'Error');
    this.router.navigate(['/login']);
  }
}
}