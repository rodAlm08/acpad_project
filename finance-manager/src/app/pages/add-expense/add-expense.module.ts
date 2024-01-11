import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddExpensePageRoutingModule } from './add-expense-routing.module';

import { AddExpensePage } from './add-expense.page';

import { HttpClientModule } from '@angular/common/http';
import { ChartService } from 'src/app/services/chart.service';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddExpensePageRoutingModule,
    HttpClientModule,
  ],
  declarations: [AddExpensePage],  
  providers: [ChartService] 
})
export class AddExpensePageModule {}
