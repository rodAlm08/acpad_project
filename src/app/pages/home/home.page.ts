import { Component, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import {
  IonModal,
  IonRouterOutlet,
  LoadingController,
  AlertController,
} from '@ionic/angular';
import { MenuController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { AddBudgetDetailsPage } from '../add-budget/add-budget.page';
import { AddBudgetService, Budget } from '../../services/add-budget.service';
import { Observable, first } from 'rxjs';
import { of } from 'rxjs';
import { NavController } from '@ionic/angular';
import { collection, query, where, writeBatch, doc } from 'firebase/firestore';
import { collectionData } from '@angular/fire/firestore';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Firestore } from '@angular/fire/firestore';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  newBudget!: Budget;
  @ViewChild(IonModal) modal!: IonModal;
  presentingElement: HTMLIonRouterOutletElement;
  personName: string = '';
  budgets$: Observable<Budget[]> | undefined;
  budget: Budget = {
    title: '',
    amount: 0,
    timestamp: new Date(),
    isSpent: false,
  };
  expenseTitle: string = '';
  expenseAmount: number = 0;
  totalExpenses: number = 0;
  remainingAmount: number = 0;
  newRemainningAmount: number = 0;
  // Declare the errorMessage property
  errorMessage: string | null = null;



  constructor(
    private authService: AuthService,
    private router: Router,
    private routerOutlet: IonRouterOutlet,
    private alertController: AlertController,
    private menuCtrl: MenuController,
    private modalController: ModalController,
    private Angularfirestore: AngularFirestore, // Inject AngularFirestore
    private firestore: Firestore, // Inject Firestore
    private cdr: ChangeDetectorRef
    ) {
    this.presentingElement = routerOutlet.nativeEl;
    this.resetBudget();
  }

  ngOnInit() {
    this.personName = this.authService.getCurrentUserEmail() || 'Guest';
    this.loadBudgets();
  }

  // Returns the badge color based on the remaining amount
  getBadgeColor(remainingAmount: number | undefined): string {
    // Check if remainingAmount is defined
    if (remainingAmount !== undefined) {
      // Return 'green' if remainingAmount is non-negative, 'gray' otherwise
      return remainingAmount >= 0 ? 'green' : 'lightgray';
    } else {
      // Handle the case where remainingAmount is undefined
      return 'gray';
    }
  }

  // Returns the font color based on the remaining amount
  getFontColor(remainingAmount: number | undefined): string {
    // Check if remainingAmount is defined
    if (remainingAmount !== undefined) {
      // Return 'white' if remainingAmount is non-negative, 'black' otherwise
      return remainingAmount >= 0 ? 'white' : 'white';
    } else {
      // Handle the case where remainingAmount is undefined
      return 'black';
    }
  }

  // Opens the add expense page for a specific budget
  openAddExpensePage(budget: Budget) {
    const route = `/add-expense/${budget.id}`;
    this.router.navigateByUrl(route, {
      state: { budgetData: JSON.stringify(budget) },
    });

    console.log('Budget ID inside home page:', budget.id);
    console.log('TITLEEEEEE', budget.title);
  }

  // Resets the newBudget object
  resetBudget() {
    this.newBudget = {
      title: '',
      amount: 0,
      timestamp: new Date(),
      isSpent: false, // Add the isSpent property with a default value of false
      totalExpenses: 0,
      remainingAmount: 0,
      expenses: [],
    };
  }

  // Opens the side menu
  openMenu() {
    this.menuCtrl.open('start');
  }

  // Navigates to a specific page
  navigateTo(page: string) {
    console.log(`Navigating to ${page}`);
    this.menuCtrl.close('start');
  }

  // Opens the add budget modal
  async openAddBudgetModal() {
    console.log('Opening Add Budget Modal');
    const modal = await this.modalController.create({
      component: AddBudgetDetailsPage,
    });

    modal.onDidDismiss().then((data) => {
      console.log('Modal dismissed with data:', data);
      if (data.role === 'success') {
        console.log('Loading budgets after modal dismissal');
        this.loadBudgets();
      }
    });

    return await modal.present();
  }

  // Opens the update input alert for a budget
  openUpdateInput(budget: Budget) {
    const alert = this.alertController.create({
      header: 'Update Budget',
      inputs: [
        {
          name: 'title',
          type: 'text',
          placeholder: 'Title',
          value: budget.title,
        },
        {
          name: 'amount',
          type: 'number',
          placeholder: 'Amount',
          value: budget.amount.toString(), // Convert amount to string to avoid issues with number input
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Update',
          
          handler: async (data) => {
            const updatedBudget = {
              ...budget,
              ...data,
              remainingAmount: data.amount - data.totalExpenses,
            };
  
            await this.Angularfirestore.collection('budgets').doc(budget.id).update(updatedBudget);

            // Fetch the updated budget from Firestore
            const updatedBudgetFromFirestore = await this.Angularfirestore.collection<Budget>('budgets').doc(budget.id).valueChanges().pipe(first()).toPromise();

  
            // Update local state
            this.budgets$ = this.Angularfirestore.collection<Budget>('budgets').valueChanges();
          
  
            // Force change detection
            this.cdr.detectChanges();
  
            // Dismiss the modal with the updated budget
            this.modalController.dismiss({
              role: 'success',
              data: updatedBudget,
            });
          },
        },
      ],
    });
  
    // Present alert to the user
    alert.then((alert) => {
      alert.present();
    });
  

    setTimeout(() => {
      const firstInput: any = document.querySelector('ion-alert input');
      firstInput.focus();
    }, 250);
  }

  loadBudgets() {
    this.authService.getCurrentUserId().then((userId) => {
      if (!userId) {
        // Handle the case where user ID is not available
        return;
      }

      const budgetsCollection = this.Angularfirestore.collection(
        'budgets',
        (ref) => ref.where('userId', '==', userId)
      );

      budgetsCollection.valueChanges({ idField: 'id' }).subscribe(
        (budgets: any[]) => {
          //console.log('Fetched budgets:', budgets);

          if (budgets && budgets.length > 0) {
            // Your existing logic for handling budgets
            this.budgets$ = of(budgets);
            this.errorMessage = null; // Clear the error message
          } else {
            // Set error message if no budgets are found
            this.errorMessage = 'Please add a Budget.';
            this.budgets$ = of([]); // Set budgets$ to an empty array or undefined based on your requirement
          }
        },
        (error) => {
          this.errorMessage = 'Error fetching budgets. Please try again later.';
          console.error('Error fetching budgets:', error);
        }
      );
    });
  }

  // Formats the timestamp to a Date object
  formatTimestamp(timestamp: any): Date {
    if (timestamp instanceof Date) {
      return timestamp;
    } else if (timestamp?.seconds) {
      return new Date(timestamp.seconds * 1000);
    }
    return new Date(); // Default value if timestamp is not valid
  }

  // Deletes a budget and its associated expenses
  async deleteBudget(budget: Budget) {
    try {
      const alert = await this.alertController.create({
        header: 'Delete Budget',
        message: 'Are you sure you want to delete this budget?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
          },
          {
            text: 'Delete',
            handler: async () => {
              const firestore = this.firestore; // Get the underlying FirebaseFirestore instance
              const batch = writeBatch(firestore);

              // Get all expenses linked to the budget
              const expensesQuery = query(
                collection(firestore, 'expenses'),
                where('budgetId', '==', budget.id)
              );
              const expenses = await collectionData(expensesQuery, {
                idField: 'id',
              })
                .pipe(first())
                .toPromise();

              // Queue up the deletion of each expense
              if (expenses) {
                // Queue up the deletion of each expense
                for (const expense of expenses) {
                  const expenseRef = doc(firestore, `expenses/${expense.id}`);
                  batch.delete(expenseRef);
                }
              }

              // Queue up the deletion of the budget itself
              const budgetRef = doc(firestore, `budgets/${budget.id}`);
              batch.delete(budgetRef);

              // Commit the batch
              await batch.commit();
            },
          },
        ],
      });
      await alert.present();
    } catch (error) {
      console.error('Error deleting budget and associated expenses:', error);
    }
  }

  // Opens the edit budget modal
  async editBudget(budget: Budget) {
    const modal = await this.modalController.create({
      component: AddBudgetDetailsPage,
      componentProps: {
        budgetData: budget,
      },
    });

    modal.onDidDismiss().then((data) => {
      if (data.role === 'success') {
        // Handle the updated budget and refresh the list
        this.loadBudgets();
      }
    });

    return await modal.present();
  }

  // Toggles the isSpent property of a budget
  async toggleBudget(budget: Budget) {
    const updatedBudget = { ...budget, isSpent: !budget.isSpent };
    await this.Angularfirestore.collection('budgets')
      .doc(budget.id)
      .update(updatedBudget);
  }

  

}
