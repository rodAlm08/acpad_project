import { Injectable, EventEmitter } from '@angular/core';
import { first } from 'rxjs/operators'; // Import the 'first' operator
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import {
  addDoc,
  collection,
  CollectionReference,
  doc,
  Firestore,
  query,
  collectionData,
  where,
  updateDoc,
  deleteDoc,
} from '@angular/fire/firestore';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import { AuthService } from './auth.service';

import { AngularFireAuth } from '@angular/fire/compat/auth';


// Define interfaces for Budget and Expense
export interface Expense {
  id?: string;
  title: string;
  amount: number;
  timestamp?: Date;
  budgetId?: string;
  expenseId: string;
  userId: string | null;
}

export interface Budget {  
  id?: string;
  title: string;
  amount: number;
  timestamp?: Date;
  user?: string;
  expenses?: Expense[];
  totalExpenses?: number;
  remainingAmount?: number;
  isSpent?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AddBudgetService {
  private collectionRef: CollectionReference;
  private budgets$: BehaviorSubject<Budget[]> = new BehaviorSubject<Budget[]>(
    []
  );
  private budgetsSub!: Subscription;
  // Create an event emitter
  expenseAdded: EventEmitter<void> = new EventEmitter<void>();
  private budgetsCollection: AngularFirestoreCollection<Budget>;
  expenseUpdated: any;

  constructor(
    private firestore: Firestore,
    private auth: Auth,
    private afs: AngularFirestore,
    private authService: AuthService,
    private afAuth: AngularFireAuth
  ) {
    this.budgetsCollection = afs.collection<Budget>('budgets');
    this.collectionRef = collection(this.firestore, 'budgets');
    this.subscribeToAuthState();
  }

  // Retrieves a budget by its ID
  getBudgetById(budgetId: string): Observable<Budget | undefined> {
    const budgetDoc = this.budgetsCollection.doc<Budget>(budgetId);
    return budgetDoc.valueChanges();
  }

  // Retrieves the current budget for the authenticated user
  async getCurrentBudget(): Promise<Budget | undefined> {
    try {
      const user = this.auth.currentUser;

      if (!user) {
        console.error('User is not authenticated.');
        return undefined;
      }

      const userId = user.uid;
      const budgetsQuery = query(
        this.collectionRef,
        where('user', '==', userId)
      );

      // Use the 'first' operator to get the first emitted value
      const budgets = await collectionData(budgetsQuery, { idField: 'id' })
        .pipe(first())
        .toPromise();

      console.log('Fetched budgets:', budgets);

      if (budgets && budgets.length > 0) {
        console.log('Budgets inside getCurrentBudget:', budgets);
        return budgets[0] as Budget; // Explicitly cast to Budget
      } else {
        console.error('User has no budgets.');
        return undefined;
      }
    } catch (error) {
      console.error('Error fetching current budget:', error);
      throw error;
    }
  }

  // Subscribes to the authentication state and updates the budgets accordingly
  private subscribeToAuthState(): void {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.subscribeToBudgets(user.uid);
      } else {
        this.unsubscribeFromBudgets();
      }
    });
  }

  getBudgetsForUser(userId: string): Observable<any[]> {
    return this.afs
      .collection('budgets', (ref) => ref.where('user', '==', userId))
      .valueChanges();
  }

  // Subscribes to the budgets collection for a specific user
  subscribeToBudgets(userId: string): void {
    const budgetsQuery = query(this.collectionRef, where('user', '==', userId));

    const budgets$ = collectionData(budgetsQuery, {
      idField: 'id',
    }) as Observable<Budget[]>;

    this.budgetsSub = budgets$.subscribe((budgets) => {
      this.budgets$.next(budgets);
    });
  }

  // Unsubscribes from the budgets collection
  private unsubscribeFromBudgets(): void {
    this.budgets$.next([]);
    if (this.budgetsSub) {
      this.budgetsSub.unsubscribe();
    }
  }

  // Creates a new budget
  async createBudget(budget: Budget) {
    try {
      await addDoc(this.collectionRef, {
        ...budget,
        user: this.auth.currentUser?.uid,
        timestamp: new Date(),
        expenses: [],
      });
    } catch (error) {
      console.error('Error creating budget:', error);
    }
  }

  // Returns the budgets as an observable
  readBudgets() {
    return this.budgets$.asObservable();
  }

  // Updates a budget
  updateBudget(budget: Budget) {
    const ref = doc(this.firestore, `budgets/${budget.id}`);
    const updatePromise = updateDoc(ref, {
      title: budget.title,
      amount: budget.amount,
      expenses: budget.expenses,
      totalExpenses: budget.totalExpenses,
      remainingAmount: budget.remainingAmount,
      isSpent: budget.isSpent,
    });

    // Emit the updated budget after the update is complete
    updatePromise.then(async () => {
      const updatedBudget = { ...budget, expenses: budget.expenses }; // Include other fields if needed

      // Update individual expenses in Firestore using the budgetId
      for (const expense of updatedBudget.expenses || []) {
        const expenseRef = doc(this.firestore, `expenses/${expense.id}`);
        await updateDoc(expenseRef, {
          title: expense.title,
          amount: expense.amount,
          timestamp: expense.timestamp,
          // Add other fields as needed
        });
      }

      // Update the BehaviorSubject with the updated budget
      this.budgets$.next(
        this.budgets$.value.map((b) => (b.id === budget.id ? updatedBudget : b))
      );
    });

    return updatePromise;
  }

  // Deletes a budget
  async deleteBudget(budget: Budget) {
    try {
      const ref = doc(this.firestore, `budgets/${budget.id}`);
      await deleteDoc(ref);
    } catch (error) {
      console.error('Error deleting budget:', error);
    }
  }

  async getCurrentUserId(): Promise<string | null> {
    const user = await this.afAuth.currentUser;
    return user ? user.uid : null;
    console.log('Logged in as GET CURRENT USER ID: ', user?.uid);
  }


  // Creates an expense for a specific budget
  async createExpense(expense: Expense, budgetId: string) {
    try {
      const existingBudget = await this.getBudgetById(budgetId)
        .pipe(first())
        .toPromise();
  
      if (existingBudget) {
        // Get the user ID
        const userId = await this.authService.getCurrentUserId();
  
        const newExpense: Expense = {
          title: expense.title,
          amount: expense.amount,
          timestamp: new Date(),
          budgetId: budgetId,
          expenseId: '', // Leave this empty for now
          userId: userId, // Await the result here
        };
  
        existingBudget.expenses?.push(newExpense);
        existingBudget.totalExpenses = (existingBudget.expenses || []).reduce(
          (total, e) => total + e.amount,
          0
        );
        existingBudget.remainingAmount =
          existingBudget.amount - existingBudget.totalExpenses;
  
        this.budgets$.next([...this.budgets$.value]);
  
        const budgetRef = doc(this.firestore, `budgets/${budgetId}`);
        await updateDoc(budgetRef, {
          expenses: existingBudget.expenses,
          totalExpenses: existingBudget.totalExpenses,
          remainingAmount: existingBudget.remainingAmount,
        });
  
        const expenseCollectionRef = collection(this.firestore, 'expenses');
        const addedExpenseRef = await addDoc(expenseCollectionRef, {
          ...newExpense,
          timestamp: new Date(),
        });
  
        // Assign the generated ID to the expense's expenseId field
        newExpense.expenseId = addedExpenseRef.id;
  
        // Update the existing budget in Firestore with the assigned expenseId
        existingBudget.expenses![existingBudget.expenses!.length - 1].expenseId =
          addedExpenseRef.id;
  
        await updateDoc(budgetRef, {
          expenses: existingBudget.expenses,
        });
  
        console.log('Expense added successfully:', addedExpenseRef.id);
  
        this.expenseAdded.emit();
      } else {
        console.error('Budget not found.');
      }
    } catch (error) {
      console.error('Error creating expense:', error);
      throw error; // Rethrow the error for handling in the calling function
    }
  }
  


// Updates an expense for a specific budget
async updateExpense(expense: Expense, budgetId: string) {
  try {
    const user = this.auth.currentUser;

    if (!user) {
      console.error('User is not authenticated.');
      return;
    }

    // Fetch the budget
    const budget = await this.getBudgetById(budgetId).pipe(first()).toPromise();

    if (!budget) {
      console.error('Current budget is undefined.');
      return;
    }

    // Find the index of the expense to be updated
    const index = (budget.expenses ?? []).findIndex((e) => e.id === expense.id);

    if (index !== -1) {
      // Update the local budget object first
      budget.expenses![index] = expense;
      budget.totalExpenses = (budget.expenses || []).reduce((total, e) => total + e.amount, 0);
      budget.remainingAmount = budget.amount - budget.totalExpenses;

      console.log('Budget after updating expense:', budget.remainingAmount);

      // Emit the updated budget before the Firestore update
      this.budgets$.next([...this.budgets$.value]);

      // Update the budget in Firestore, including the updated expense
      const budgetRef = doc(this.firestore, `budgets/${budgetId}`);
      await updateDoc(budgetRef, {
        expenses: budget.expenses ?? [],
        totalExpenses: budget.totalExpenses,
        remainingAmount: budget.remainingAmount,
      });

      // Update the expense in Firestore
      const expenseRef = doc(this.firestore, `expenses/${expense.id}`);
      await updateDoc(expenseRef, {
        title: expense.title,
        amount: expense.amount,
        timestamp: expense.timestamp,
        expenseId: expense.expenseId, // Include expenseId field
        // Add other fields as needed
      });

      // Emit the event when an expense is updated
      console.log('Expense updated event emitted');
      this.expenseUpdated.emit();
    } else {
      console.error('Expense not found in the budget.');
    }
  } catch (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
}

 // Delete an expense document from Firestore
 async deleteExpenseDocument(expenseId: string) {
  try {
    // Create a reference to the expense document
    const expenseRef = doc(this.firestore, `expenses/${expenseId}`);

    // Delete the expense document from Firestore
    await deleteDoc(expenseRef);
  } catch (error) {
    console.error('Error deleting expense document:', error);
    throw error;
  }
}


  // Updates the remaining amount of a budget
  updateRemainingAmount(
    budgetId: string,
    remainingAmount: number
  ): Promise<void> {
    const ref = doc(this.firestore, `budgets/${budgetId}`);
    return updateDoc(ref, { remainingAmount });
  }
}
