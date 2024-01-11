import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddExpenseModalPageRoutingModule } from './add-expense-modal-routing.module';

import { AddExpenseModalPage } from './add-expense-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddExpenseModalPageRoutingModule
  ],
  declarations: [AddExpenseModalPage]
})
export class AddExpenseModalPageModule {}
