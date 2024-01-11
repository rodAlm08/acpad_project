import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { ChartService } from '../../services/chart.service';
import { ChangeDetectorRef } from '@angular/core';
import { Observable, Subject, from, of, switchMap, takeUntil } from 'rxjs';
import { Chart, ChartConfiguration, ChartTypeRegistry } from 'chart.js';
import { AuthService } from 'src/app/services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Budget, Expense } from '../../services/add-budget.service';
import { AddBudgetService } from '../../services/add-budget.service';
import { Subscription } from 'rxjs';
import { CanvasWithChart } from '../../services/chart.service';
import { ViewDidEnter } from '@ionic/angular';
import { AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-insight',
  templateUrl: './insight.page.html',
  styleUrls: ['./insight.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InsightPage implements OnInit {
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  @ViewChild('barChart', { static: false }) barChartCanvas:
    | ElementRef
    | undefined;

  budgets: any[] = [];

  constructor(
    private chartService: ChartService,
    private authService: AuthService
  ) {}

   ngOnInit() {
    const userPromise = this.authService.getCurrentUserId();

    if (userPromise instanceof Promise) {
      from(userPromise).subscribe((user) => {
        if (user) {
          this.chartService.fetchData(user).subscribe(
            (budgets: any[]) => {
              this.budgets = budgets;
              console.log('Budgets:', this.budgets);

              // Check if expenses is defined before preparing doughnut chart data
              if (this.budgets) {
                const chartData = this.prepareBarChartData(this.budgets);
                console.log('Chart data NGOINIT:', chartData);

                this.chartService.renderBarChart(
                  chartData,
                  this.barChartCanvas?.nativeElement
                );

              } else {
                console.error('Budget not found.');
              }
            },
            (error) => {
              console.error('Error fetching budgets:', error);
            }
          );
        }
      });
    } else {
      console.error('getUser method did not return a Promise.');
    }

    if (this.barChartCanvas && this.barChartCanvas.nativeElement) {
      const canvasElement = this.barChartCanvas.nativeElement;
      console.log('Canvas Size:', canvasElement.width, canvasElement.height);
    } else {
      console.error('Canvas element not available INSIGHTS.');
    }
  }

  private prepareBarChartData(budgets: Budget[]): any {
    const labels: string[] = [];
    const datasets: any[] = [];

    // Iterate through each budget
    budgets.forEach((budget) => {
      labels.push(budget.title);

      // Extracting the actual dataset from the additional [0] layer
      const actualDatasets = budgets.map((budget) => budget);
      console.log('Actual Datasets:', actualDatasets);
      const expensesData = budget.totalExpenses;
      console.log('Expenses Data:', expensesData);

      datasets.push({
        label: budget.title,
        data: [expensesData], // Use totalExpenses directly
        backgroundColor: this.chartService.generateRandomColors(1),
      });
    });
    console.log('datasets*********************', datasets);
    return { labels, datasets };
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
