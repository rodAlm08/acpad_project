import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { InsightPageRoutingModule } from './insight-routing.module';
import { HeaderModule } from 'src/app/app-header/app-header.module';
import { InsightPage } from './insight.page';
import { HttpClientModule } from '@angular/common/http';
import { ChartService } from 'src/app/services/chart.service';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, InsightPageRoutingModule, HeaderModule, HttpClientModule],
  declarations: [InsightPage],
  providers: [ChartService] 
})

export class InsightPageModule {}
