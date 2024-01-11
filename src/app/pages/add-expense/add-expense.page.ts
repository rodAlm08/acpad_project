import { Component, EventEmitter, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Budget, Expense } from '../../services/add-budget.service';
import { AddExpenseModalPage } from '../add-expense-modal/add-expense-modal.page';
import { AddBudgetService } from '../../services/add-budget.service';
import { Observable, Subscription, of, takeUntil, Subject } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ChangeDetectorRef } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import {
  arrayRemove,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  writeBatch,
  updateDoc
} from '@angular/fire/firestore';
import { Firestore } from '@angular/fire/firestore';
import { ChartService } from '../../services/chart.service';
import { ViewChild, ElementRef } from '@angular/core';
import { CanvasWithChart } from '../../services/chart.service';
import { OnDestroy } from '@angular/core';
import { ViewDidEnter } from '@ionic/angular';
import { ExportDataService } from 'src/app/services/export-data.service';
import { DomSanitizer } from '@angular/platform-browser';
import { DownloadViewerModalComponent } from '../download-viewer-modal/download-viewer-modal.component';

@Component({
  selector: 'app-add-expense',
  templateUrl: './add-expense.page.html',
  styleUrls: ['./add-expense.page.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
//this class is used to add expenses to the budget
export class AddExpensePage implements OnInit, OnDestroy, ViewDidEnter {
  // Use ViewChild to get a reference to the canvas element
  @ViewChild('doughnutChart', { static: false }) doughnutChartCanvas:
    | ElementRef
    | undefined;

   
    expenseUpdated: EventEmitter<any> = new EventEmitter<any>();


  // Define the expense categories
  expenseCategories: { name: string; icon: string }[] = [
    { name: 'General', icon: 'pricetag' },
    { name: 'Meal', icon: 'restaurant' },
    { name: 'Drink', icon: 'wine' },
    { name: 'Traffic', icon: 'car' },
    { name: 'Movie', icon: 'film' },
    { name: 'Shopping', icon: 'cart' },
    { name: 'Ticket', icon: 'ticket' },
    { name: 'Hotel', icon: 'bed' },
    { name: 'Gift', icon: 'gift' },
    { name: 'Food', icon: 'fast-food' },
    { name: 'Leisure', icon: 'game-controller' },
    { name: 'Pet', icon: 'paw' },
    { name: 'Beauty', icon: 'cut' },
    { name: 'Medical', icon: 'medkit' },
  ];

  // Define the budget object
  budget: Budget = {
    title: '',
    amount: 0,
    timestamp: new Date(),
    expenses: [],
    totalExpenses: 0,
    remainingAmount: 0,
    isSpent: false,
  };
  // Define the expense object
  expenseTitle: string = '';
  expenseAmount: number = 0;
  totalExpenses: number = 0;
  remainingAmount: number = 0;
  isSpent: boolean = false;
  expenseAdded: boolean = false;

  // Define the budgets$ observable
  budgets$: Observable<Budget[]> | undefined;

  // Define the expenseAddedSubscription
  private expenseAddedSubscription: Subscription = new Subscription();

  // Define the ngUnsubscribe Subject
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  // Define the budgetId property
  budgetId: string | undefined;

  // Define the showDoughnutChart property
  showDoughnutChart: any;

  constructor(
    private route: ActivatedRoute,
    private modalController: ModalController,
    private angularFirestore: AngularFirestore,
    private addBudgetService: AddBudgetService,
    private auth: AngularFireAuth,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private alertController: AlertController,
    private firestore: Firestore,
    private chartService: ChartService,
    private ExportData: ExportDataService,
    private sanitizer: DomSanitizer
  ) {}

  // ionViewDidEnter method to render the doughnut chart after the view is loaded
  ionViewDidEnter() {
    // Check if the canvas element is available
    if (this.doughnutChartCanvas && this.doughnutChartCanvas.nativeElement) {
      const canvas: CanvasWithChart = this.doughnutChartCanvas.nativeElement;

      // Check if the doughnut chart should be shown and if the budget and expenses are available
      if (this.showDoughnutChart && this.budget && this.budget.expenses) {
        const chartData = this.prepareDoughnutChartData(this.budget.expenses);
        this.chartService.renderDoughnutChart(chartData, canvas);
      }
    }
  }

  // ngOnInit method to subscribe to the expenseAdded event and fetch the budget details
  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.budgetId = params['id'];
      if (this.budgetId) {
        this.addBudgetService
          .getBudgetById(this.budgetId)
          .subscribe((budget) => {
            if (budget) {
              this.budget = budget;
              this.calculateRemainingAmount();
              //  console.log('Budget inside add-expense:', this.budget);

              // Check if expenses is defined before preparing doughnut chart data
              if (this.budget.expenses) {
                const chartData = this.prepareDoughnutChartData(
                  this.budget.expenses
                );
                // Show doughnut chart
                this.showDoughnutChart = false;
                this.chartService.renderDoughnutChart(
                  chartData,
                  this.doughnutChartCanvas?.nativeElement
                );
              } else {
                console.error('Expenses not found in the budget.');
              }
            } else {
              console.error('Budget not found.');
              // Navigate back to home page with an error message
              this.router.navigate(['/home'], {
                queryParams: { error: 'Budget not found' },
              });
            }
          });
      }
    });
  }

  // ngOndestroy method to unsubscribe from the expenseAdded event
  ngOnDestroy() {
    // Unsubscribe from the expenseAdded event to prevent memory leaks
    this.expenseAddedSubscription.unsubscribe();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  // to toggle on and off the doughnut chart
  toggleDoughnutChart(): void {
    this.showDoughnutChart = !this.showDoughnutChart;
    this.cdr.detectChanges(); // Trigger change detection

    // Check if the doughnut chart should be shown and if the budget and expenses are available
    if (this.showDoughnutChart && this.budget && this.budget.expenses) {
      const chartData = this.prepareDoughnutChartData(this.budget.expenses);
      const canvas: CanvasWithChart | undefined =
        this.doughnutChartCanvas?.nativeElement;

      if (canvas) {
        this.chartService.renderDoughnutChart(chartData, canvas);
      } else {
        console.error(
          'Canvas element is undefined after toggling doughnut chart.'
        );
      }
    }
  }

  // prepareDoughnutChartData method to prepare the data for the doughnut chart
  private prepareDoughnutChartData(expenses: Expense[]): any {
    // Extract data from expenses and format it for doughnut chart
    const labels = expenses.map((expense) => expense.title);
    const data = {
      labels: labels,
      datasets: [
        {
          data: expenses.map((expense) => expense.amount),
          backgroundColor: this.chartService.generateRandomColors(
            expenses.length
          ),
        },
      ],
    };
    return data;
  }

  //loadBudgetDetails method to load the budget details
  async loadBudgetDetails(budgetId: string) {
    try {
      // Fetch the budget details from Firestore based on the budgetId
      const budgetDoc = await getDoc(
        doc(this.firestore, `budgets/${budgetId}`)
      );

      if (budgetDoc.exists()) {
        // Extract and use the budget data
        const budgetData = budgetDoc.data();
        //console.log('Budget Details:', budgetData);
      } else {
        console.log('Budget not found');
      }
    } catch (error) {
      console.error('Error loading budget details:', error);
    }
  }

  async deleteExpense(expenseId: string, budgetId: string) {

    console.log('Expense ID:', expenseId);
    console.log('Budget ID:', budgetId);

    try {
      // Check if the expenseId is valid
      if (!expenseId) {
        console.warn('Expense ID is missing. Unable to delete the expense.');
        return;
      }
     // console.log('Expense ID:', expenseId);
  
      const alert = await this.alertController.create({
        header: 'Delete Expense',
        message: 'Are you sure you want to delete this expense?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
          },
          {
            text: 'Delete',
            handler: async () => {
              try {
                const firestore = this.firestore; // Get the underlying FirebaseFirestore instance
                const batch = writeBatch(firestore);
  
                // Get the budget document reference
                const budgetRef = doc(firestore, 'budgets', budgetId);
                console.log('Budget Ref:', budgetRef);
                const budgetSnapshot = await getDoc(budgetRef);
                console.log('Budget Snapshot:', budgetSnapshot);
  
                if (budgetSnapshot.exists()) {
                  const budgetDoc = budgetSnapshot;
                  const expenses = budgetDoc.data()?.['expenses'] || [];
  
                  // Find the index of the expense in the expenses array
                  const index = expenses.findIndex((expense: any) => expense.expenseId === expenseId);
  
                  if (index !== -1) {
                    // Queue up the deletion of the expense
                    batch.update(budgetDoc.ref, {
                      expenses: arrayRemove(expenses[index]), // Remove the expense from the array
                    });
  
                    // Commit the batch
                    await batch.commit();
  
                    console.log('Expense deleted successfully:', expenseId);
  
                    // Update the budget details after deleting the expense
                    this.loadBudget();
                  } else {
                    console.error('Expense not found in the budget.');
                  }
                } else {
                  console.error('Budget document does not exist.');
                }
              } catch (error) {
                console.error('Error in delete handler:', error);
              }
            },
          },
        ],
      });
      await alert.present();
    } catch (error) {
      console.error('Error deleting expense:', error);
      console.log('Expense ID:', expenseId);
      console.log('Budget ID:', budgetId);
      throw error;
    }
  }
  
  
 

  // Method to get the icon based on the expense title
  getIconForExpense(expenseTitle: string): string {
    const matchingCategory = this.expenseCategories.find(
      (category) => category.name === expenseTitle
    );
    return matchingCategory ? matchingCategory.icon : 'default-icon'; // Replace 'default-icon' with a default icon name
  }

  // loadBudget method to load the budget details
  async loadBudget() {
    try {
      // Get the budget details from the route data
      const routeData = this.route.snapshot.data;

      if (routeData && routeData['budgetData']) {
        this.budget = JSON.parse(routeData['budgetData']);
        this.calculateRemainingAmount();
      } else {
        console.error('Budget data is not available in the route data.');
      }
    } catch (error) {
      console.error('Error loading budget:', error);
    }
  }

  //calculateRemainingAmount method to calculate the remaining amount for the budget
  calculateRemainingAmount() {
    if (this.budget && this.budget.id) {
      // Access budget properties safely
      this.budget.remainingAmount =
        this.budget.amount - (this.budget.totalExpenses || 0);
      //console.log('Remaining amount: ' + this.budget.remainingAmount);

      // Update the remaining amount in Firestore
      this.addBudgetService
        .updateRemainingAmount(this.budget.id, this.budget.remainingAmount)
        .then(() => {
          console.log('Remaining amount updated in Firestore');
        })
        .catch((error) => {
          console.error('Error updating remaining amount:', error);
        });
    }
  }

  // openModal method to open the modal
  async openModal() {
    try {
      if (this.budgetId) {
        // Fetch the latest budget data
        // Budgets inside getCurrentBudget
        const latestBudget = await this.addBudgetService.getCurrentBudget();

        // console.log(
        //   'budget id inside OpenModal ADD-EXPENSE >>>> ' + this.budgetId
        // );
        if (latestBudget) {
          const modal = await this.modalController.create({
            component: AddExpenseModalPage,
            componentProps: {
              expenseCategories: this.expenseCategories,
              budgetId: this.budgetId, // Pass the correct budgetId
            },
          });

          // Subscribe to the modal dismissal event
          modal.onDidDismiss().then((data) => {
            console.log('Modal dismissed with data:', data);
            if (data.role === 'success') {
              //console.log('Loading budgets after modal dismissal');
              this.loadBudgets(); // Refresh budgets after adding an expense
              this.cdr.markForCheck(); // Trigger change detection
            }
          });

          await modal.present();
        } else {
          console.error('Latest budget is undefined.');
        }
      } else {
        console.error('Budget ID is not available.');
      }
    } catch (error) {
      console.error('Error fetching latest budget:', error);
    }
  }

  // loadBudgets method to load all the budgets
  async loadBudgets() {
    try {
      const user = await this.auth.currentUser;

      if (user) {
        const userId = user.uid;

        this.angularFirestore
          .collection('budgets', (ref) => ref.where('user', '==', userId))
          .valueChanges({ idField: 'id' })
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(
            (budgets: { id: string }[]) => {
              //console.log('Fetched budgets:', budgets);

              // Explicitly cast the received data to the Budget[] type
              this.budgets$ = of(budgets as Budget[]);
            },
            (error) => {
              console.error('Error fetching budgets:', error);
            }
          );
      } else {
        console.error('User is not authenticated.');
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  }

  //exportData method to export the data
  exportData() {
    this.ExportData.exportToPDF('contentToExport')
      .then((blobUrl) => {
        this.modalController
          .create({
            component: DownloadViewerModalComponent,
            componentProps: {
              pdfUrl: this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl),
            },
          })
          .then((modal) => modal.present());
      })
      .catch((error) => console.error('Export failed', error));
  }
}
