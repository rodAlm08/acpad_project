import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Expense } from 'src/app/services/add-budget.service';
import { AddBudgetService } from '../../services/add-budget.service';
import { ExpenseUpdateService } from '../../services/expense-update.service';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-add-expense-modal',
  templateUrl: './add-expense-modal.page.html',
  styleUrls: ['./add-expense-modal.page.scss'],
})

//this class is used to manage the add expense modal page
export class AddExpenseModalPage implements OnInit {
  @Input() expenseCategories!: { name: string; icon: string }[];
  @Input() budgetId: any; // Accept budgetId as an input

  expenses: Expense[] = [];
  selectedCategory: string = '';
  expenseValue: number | undefined;

  constructor(
    private modalController: ModalController,
    private addBudgetService: AddBudgetService,
    private expenseUpdateService: ExpenseUpdateService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

 ngOnInit() {}

// Function to add an expense
 async addExpense() {
  console.log('Selected Category:', this.selectedCategory);
  console.log('Expense Value:', this.expenseValue);

  // Get the user ID
  const userId = await this.addBudgetService.getCurrentUserId();
  console.log('User ID:', userId);

  // Create a new expense object
  const newExpense: Expense = {
    title: this.selectedCategory,
    amount: this.expenseValue || 0,
    timestamp: new Date(),
    expenseId: '', 

    userId: userId,
  };



  try {
    // Use the service to create the expense
    await this.addBudgetService.createExpense(newExpense, this.budgetId);

    // Notify the shared service about the expense addition
    this.expenseUpdateService.notifyExpenseAdded();

    // Close the modal
    await this.modalController.dismiss({ role: 'success', data: newExpense });

    // Navigate to the expense page with the current budget ID using Router
    this.router.navigateByUrl(`/add-expense/${this.budgetId}`, {
      state: { budgetData: newExpense },
    });

  } catch (error) {
    console.error('Error creating expense:', error);
    // Handle the error if needed
  }
}


// Function to close the modal
  closeModal() {
    this.modalController.dismiss();
  }
}
