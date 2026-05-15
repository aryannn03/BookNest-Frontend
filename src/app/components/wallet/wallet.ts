import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { WalletService } from '../../services/wallet';
import { ToastrService } from 'ngx-toastr';
import { DepositTotalPipe, WithdrawTotalPipe } from '../../pipes/wallet.pipe';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, FormsModule, DepositTotalPipe, WithdrawTotalPipe],
  templateUrl: './wallet.html',
  styleUrl: './wallet.css'
})
export class WalletComponent implements OnInit {

  wallet: any = null;
  statements: any[] = [];
  isLoading = true;
  isAddingMoney = false;
  showTopUpForm = false;

  topUpAmount = 500;
  topUpRemarks = 'Wallet top-up';

  quickAmounts = [100, 500, 1000, 2000, 5000];

  constructor(
    private walletService: WalletService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadWallet();
  }

  loadWallet(): void {
    this.isLoading = true;
    this.walletService.getMyWallet().subscribe({
      next: (wallet) => {
        this.wallet = wallet;
        this.statements = wallet.statements || [];
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  addMoney(): void {
    if (!this.topUpAmount || this.topUpAmount <= 0) {
      this.toastr.warning('Please enter a valid amount');
      return;
    }

    this.isAddingMoney = true;
    this.walletService.addMoney(
      this.topUpAmount, this.topUpRemarks
    ).subscribe({
      next: (wallet) => {
        this.wallet = wallet;
        this.statements = wallet.statements || [];
        this.toastr.success(
          `₹${this.topUpAmount} added to wallet!`);
        this.showTopUpForm = false;
        this.topUpAmount = 500;
        this.isAddingMoney = false;
      },
      error: () => {
        this.toastr.error('Failed to add money');
        this.isAddingMoney = false;
      }
    });
  }

  getTransactionIcon(type: string): string {
    return type === 'Deposit' ?
      'fas fa-arrow-down' : 'fas fa-arrow-up';
  }

  getTransactionClass(type: string): string {
    return type === 'Deposit' ?
      'deposit' : 'withdraw';
  }
}