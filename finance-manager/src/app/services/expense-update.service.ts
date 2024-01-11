import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExpenseUpdateService {

  private expenseAddedSubject: Subject<void> = new Subject<void>();

  expenseAdded$ = this.expenseAddedSubject.asObservable();

  notifyExpenseAdded() {
    this.expenseAddedSubject.next();
  }
}
