import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { CartService } from '../../services/cart';
import { NotificationService } from '../../services/notification';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent implements OnInit {

  isLoggedIn = false;
  isAdmin = false;
  fullName = '';
  cartCount = 0;
  unreadCount = 0;
  searchKeyword = '';

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.updateNavbar();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateNavbar();
      });
  }

  updateNavbar(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAdmin = this.authService.isAdmin();
    this.fullName = this.authService.getFullName() || '';

    if (this.isLoggedIn && !this.isAdmin) {
      this.loadCartCount();
      this.loadUnreadCount();
    } else {
      this.cartCount = 0;
      this.unreadCount = 0;
    }
  }

  loadCartCount(): void {
    this.cartService.getMyCart().subscribe({
      next: (cart) => {
        this.cartCount = cart.items?.length || 0;
      },
      error: () => {
        this.cartCount = 0;
      }
    });
  }

  loadUnreadCount(): void {
    this.notificationService.getUnreadCount().subscribe({
      next: (res) => {
        this.unreadCount = res.unreadCount || 0;
      },
      error: () => {
        this.unreadCount = 0;
      }
    });
  }

  search(): void {
    if (this.searchKeyword.trim()) {
      this.router.navigate(['/search'], {
        queryParams: { keyword: this.searchKeyword }
      });
      this.searchKeyword = '';
    }
  }

  logout(): void {
  this.authService.logout();
  this.updateNavbar();
}
}