
import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AddBudgetService } from '../../services/add-budget.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  standalone: true,
  selector: 'app-add-budget',
  templateUrl: './add-budget.page.html',
  styleUrls: ['./add-budget.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ]
})
export class AddBudgetDetailsPage {
  budgetTitle: string = "";
  budgetAmount: number = 0;

  constructor(
    private modalController: ModalController,
    private firestore: AngularFirestore,
    private addBudgetService: AddBudgetService,
    private authService: AuthService
  ) {}

  addBudget() {
    // Get the current user's ID as a Promise
    const userIdPromise = this.authService.getCurrentUserId();
  
    // Resolve the Promise to get the actual user ID value
    userIdPromise.then((userId) => {
      if (!userId) {
        // Handle the case where user ID is not available
        return;
      }
  
      const newBudget = {
        title: this.budgetTitle,
        amount: this.budgetAmount,
        timestamp: new Date(),
        expenses: [], // Assuming you initialize expenses as an empty array
        remainingAmount: this.budgetAmount,
        isSpent: false,
        totalExpenses: 0,
        userId: userId, // Use the resolved user ID value
      };
  
      // Add the new budget using the service
      this.addBudgetService.createBudget(newBudget);
  
      // Close the modal
      this.modalController.dismiss({ role: 'success', data: newBudget });
    });
  }
  
  closeModal() {
    this.modalController.dismiss();
  }
  

}
