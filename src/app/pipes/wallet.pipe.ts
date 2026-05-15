import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'depositTotal', standalone: true })
export class DepositTotalPipe implements PipeTransform {
  transform(statements: any[]): number {
    if (!statements) return 0;
    return statements
      .filter(s => s.transactionType === 'Deposit')
      .reduce((sum, s) => sum + s.amount, 0);
  }
}

@Pipe({ name: 'withdrawTotal', standalone: true })
export class WithdrawTotalPipe implements PipeTransform {
  transform(statements: any[]): number {
    if (!statements) return 0;
    return statements
      .filter(s => s.transactionType === 'Withdraw')
      .reduce((sum, s) => sum + s.amount, 0);
  }
}