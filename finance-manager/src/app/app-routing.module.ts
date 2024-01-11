import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login', // Redirect to login initially
    pathMatch: 'full',
  },
  {
    path: 'folder/:id',
    loadChildren: () => import('./folder/folder.module').then((m) => m.FolderPageModule),
  },
   {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then((m) => m.HomePageModule),
  },
  {
    path: 'add-budget',
    loadComponent: () => import('./pages/add-budget/add-budget.page').then((m) => m.AddBudgetDetailsPage),

    //loadChildren: () => import('./pages/add-budget/add-budget.module').then( m => m.AddBudgetDetailsPageModule)
  },
  {
    path: 'add-expense/:id',
    loadChildren: () => import('./pages/add-expense/add-expense.module').then( m => m.AddExpensePageModule)
  },
  {
    path: 'add-expense-modal/:id',
    loadChildren: () => import('./pages/add-expense-modal/add-expense-modal.module').then( m => m.AddExpenseModalPageModule)
  },
  {
    path: 'insight',
    loadChildren: () => import('./pages/insight/insight.module').then( m => m.InsightPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
