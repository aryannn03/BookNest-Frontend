import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart';
import { OrderService } from '../../services/order';
import { WalletService } from '../../services/wallet';
import { ToastrService } from 'ngx-toastr';

declare var Razorpay: any;

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class CheckoutComponent implements OnInit {

  cart: any = null;
  addresses: any[] = [];
  wallet: any = null;
  isLoading = true;
  isPlacingOrder = false;

  selectedAddressId: number | null = null;
  paymentMethod = 'COD';
  currentStep = 1;

  showAddressForm = false;
  newAddress = {
    fullName: '',
    mobileNumber: '',
    flatNumber: '',
    street: '',
    city: '',
    pincode: '',
    state: ''
  };

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private walletService: WalletService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;

    this.cartService.getMyCart().subscribe({
      next: (cart) => {
        this.cart = cart;
        if (!cart.items || cart.items.length === 0) {
          this.toastr.warning('Your cart is empty!');
          this.router.navigate(['/cart']);
        }
      },
      error: () => {}
    });

    this.orderService.getMyAddresses().subscribe({
      next: (addresses) => {
        this.addresses = addresses;
        if (addresses.length > 0) {
          this.selectedAddressId = addresses[0].addressId;
        }
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });

    this.walletService.getMyWallet().subscribe({
      next: (wallet) => { this.wallet = wallet; },
      error: () => {}
    });
  }

  saveAddress(): void {
         if (!this.newAddress.fullName ||
         !this.newAddress.mobileNumber ||
         !this.newAddress.flatNumber ||
         !this.newAddress.street ||
         !this.newAddress.city ||
         !this.newAddress.pincode ||
         !this.newAddress.state) {
       this.toastr.warning('Please fill all required fields');
       return;
     }

    this.orderService.saveAddress(this.newAddress).subscribe({
      next: (address) => {
        this.addresses.push(address);
        this.selectedAddressId = address.addressId;
        this.showAddressForm = false;
        this.newAddress = {
          fullName: '', mobileNumber: '',
          flatNumber: '', street: '', city: '',
          pincode: '', state: ''
        };
        this.toastr.success('Address saved!');
      },
      error: () => this.toastr.error('Failed to save address')
    });
  }

  placeOrder(): void {
    if (!this.selectedAddressId) {
      this.toastr.warning('Please select a delivery address');
      return;
    }
    if (!this.cart?.items?.length) {
      this.toastr.warning('Your cart is empty');
      return;
    }
    if (this.paymentMethod === 'WALLET') {
      if (!this.wallet || this.wallet.currentBalance < this.cart.totalPrice) {
        this.toastr.error('Insufficient wallet balance!');
        return;
      }
    }

    this.isPlacingOrder = true;

    if (this.paymentMethod === 'RAZORPAY') {
      this.placeRazorpayOrder();
      return;
    }

    // ── FIX: only pass addressId — backend fetches all cart items itself ──
    const orderObservable =
      this.paymentMethod === 'COD'
        ? this.orderService.placeCOD(this.selectedAddressId)
        : this.orderService.placeWallet(this.selectedAddressId);

    orderObservable.subscribe({
      next: () => {
        this.toastr.success('🎉 Order placed successfully!', 'Order Confirmed');
        this.isPlacingOrder = false;
        this.router.navigate(['/my-orders']);
      },
      error: (err) => {
        this.toastr.error(err.error?.error || 'Failed to place order');
        this.isPlacingOrder = false;
      }
    });
  }

  placeRazorpayOrder(): void {
    // ── FIX: use orderService (not walletService), only pass addressId ──
    this.orderService.createRazorpayOrder(this.selectedAddressId!).subscribe({
      next: (orderData) => {
        const options = {
          key: orderData.keyId,
          amount: orderData.amount * 100,  // paise
          currency: orderData.currency,
          name: 'BookNest',
          description: 'Book Order',
          order_id: orderData.razorpayOrderId,
          handler: (response: any) => {
            // ── FIX: use orderService, remove bookId/quantity ──
            this.orderService.verifyRazorpayPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
              this.selectedAddressId!
            ).subscribe({
              next: () => {
                this.toastr.success(
                  '🎉 Order placed successfully!', 'Order Confirmed');
                this.isPlacingOrder = false;
                this.router.navigate(['/my-orders']);
              },
              error: () => {
                this.toastr.error(
                  'Payment done but order failed. Contact support.');
                this.isPlacingOrder = false;
              }
            });
          },
          modal: {
            ondismiss: () => {
              this.toastr.warning('Payment cancelled.');
              this.isPlacingOrder = false;
            }
          },
          theme: { color: '#1976d2' }
        };

        const rzp = new Razorpay(options);
        rzp.open();
      },
      error: (err) => {
        this.toastr.error(err.error?.error || 'Failed to initiate payment');
        this.isPlacingOrder = false;
      }
    });
  }

  getSelectedAddress(): any {
    return this.addresses.find(
      addr => addr.addressId === this.selectedAddressId
    );
  }
  deleteAddress(event: Event, addressId: number): void {
  event.stopPropagation(); // prevent card selection on delete click
  this.orderService.deleteAddress(addressId).subscribe({
    next: () => {
      this.addresses = this.addresses.filter(
        a => a.addressId !== addressId);
      if (this.selectedAddressId === addressId) {
        this.selectedAddressId = this.addresses.length > 0
          ? this.addresses[0].addressId
          : null;
      }
      this.toastr.success('Address deleted');
    },
    error: (err) => {
  this.toastr.error(
    err.error?.message || 'Failed to delete address'
  );
}
  });
}

  nextStep(): void {
    if (this.currentStep < 3) this.currentStep++;
  }

  prevStep(): void {
    if (this.currentStep > 1) this.currentStep--;
  }
}