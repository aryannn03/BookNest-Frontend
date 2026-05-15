import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { OAuthCallbackComponent } from './components/oauth-callback/oauth-callback';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password'; // ← NEW
import { BooksComponent } from './components/books/books';
import { BookDetailComponent } from './components/book-detail/book-detail';
import { CartComponent } from './components/cart/cart';
import { CheckoutComponent } from './components/checkout/checkout';
import { MyOrdersComponent } from './components/my-orders/my-orders';
import { WalletComponent } from './components/wallet/wallet';
import { WishlistComponent } from './components/wishlist/wishlist';
import { NotificationsComponent } from './components/notifications/notifications';
import { ProfileComponent } from './components/profile/profile';
import { SearchResultsComponent } from './components/search-results/search-results';
import { DashboardComponent } from './components/admin/dashboard/dashboard';
import { ManageBooksComponent } from './components/admin/manage-books/manage-books';
import { AddBookComponent } from './components/admin/add-book/add-book';
import { EditBookComponent } from './components/admin/edit-book/edit-book';
import { ManageOrdersComponent } from './components/admin/manage-orders/manage-orders';
import { ManageUsersComponent } from './components/admin/manage-users/manage-users';
import { ManageReviewsComponent } from './components/admin/manage-reviews/manage-reviews';
import { InventoryComponent } from './components/admin/inventory/inventory';
import { authGuard } from './guards/auth-guard';
import { adminGuard } from './guards/admin-guard';

export const routes: Routes = [

    // ─── Public Routes ────────────────────────────────────────
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent }, // ← NEW
    { path: 'oauth-callback', component: OAuthCallbackComponent },
    { path: 'books', component: BooksComponent },
    { path: 'books/:id', component: BookDetailComponent },
    { path: 'search', component: SearchResultsComponent },

    // ─── Customer Protected Routes ────────────────────────────
    { path: 'cart', component: CartComponent,
      canActivate: [authGuard] },
    { path: 'checkout', component: CheckoutComponent,
      canActivate: [authGuard] },
    { path: 'my-orders', component: MyOrdersComponent,
      canActivate: [authGuard] },
    { path: 'wallet', component: WalletComponent,
      canActivate: [authGuard] },
    { path: 'wishlist', component: WishlistComponent,
      canActivate: [authGuard] },
    { path: 'notifications', component: NotificationsComponent,
      canActivate: [authGuard] },
    { path: 'profile', component: ProfileComponent,
      canActivate: [authGuard] },

    // ─── Admin Protected Routes ───────────────────────────────
    { path: 'admin/dashboard', component: DashboardComponent,
      canActivate: [authGuard, adminGuard] },
    { path: 'admin/books', component: ManageBooksComponent,
      canActivate: [authGuard, adminGuard] },
    { path: 'admin/books/add', component: AddBookComponent,
      canActivate: [authGuard, adminGuard] },
    { path: 'admin/books/edit/:id', component: EditBookComponent,
      canActivate: [authGuard, adminGuard] },
    { path: 'admin/orders', component: ManageOrdersComponent,
      canActivate: [authGuard, adminGuard] },
    { path: 'admin/users', component: ManageUsersComponent,
      canActivate: [authGuard, adminGuard] },
    { path: 'admin/reviews', component: ManageReviewsComponent,
      canActivate: [authGuard, adminGuard] },
    { path: 'admin/inventory', component: InventoryComponent,
      canActivate: [authGuard, adminGuard] },

    // ─── Wildcard ─────────────────────────────────────────────
    { path: '**', redirectTo: 'home' }
];