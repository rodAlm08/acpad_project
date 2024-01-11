// Import necessary Angular and Chart.js modules
import { Injectable, ElementRef } from '@angular/core';
import {
  Chart,
  ChartConfiguration,
  ChartTypeRegistry,
  registerables,
} from 'chart.js';
import { HttpClient } from '@angular/common/http';
import { ChartType } from 'chart.js';
import { Observable, of, catchError } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';

// Register Chart.js modules
Chart.register(...registerables);

// Define an interface extending the HTMLCanvasElement to include a Chart object
export interface CanvasWithChart extends HTMLCanvasElement {
  // 'data-chart' is an optional property that holds a Chart object
  'data-chart'?: Chart;
}

@Injectable({
  providedIn: 'root',
})
export class ChartService {
  // Define a collection for chart data in AngularFirestore
  private chartDataCollection: AngularFirestoreCollection<any>;
  private expenseLabels: string[] = []; // Initialize an empty array
  barChartRef: ElementRef | undefined;
  private chartInstance: Chart | undefined;
  private barChartRefs: { [key: string]: ElementRef } = {};

  constructor(
    private http: HttpClient,
    private afs: AngularFirestore // Inject AngularFirestore
  ) {
    // Initialize the chart data collection with 'budgets' collection in AngularFirestore
    this.chartDataCollection = this.afs.collection<any>('budgets');
  }

  fetchData(userId: string): Observable<any[]> {
    console.log('User ID:', userId);
    return this.afs
      .collection('budgets', (ref) => ref.where('userId', '==', userId))
      .valueChanges();
  }

  filterUserSpecificData(datasets: any[], userId: string): any[] {
    return datasets.filter((dataset) => dataset.userId === userId);
  }

  // generateRandomColors method to generate random colors for the doughnut chart
  generateRandomColors(count: number): string[] {
    // Generate random colors for the doughnut chart
    const colors = [];
    for (let i = 0; i < count; i++) {
      colors.push(
        `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(
          Math.random() * 256
        )}, ${Math.floor(Math.random() * 256)}, 0.7)`
      );
    }
    return colors;
  }

  // Generate a random color in RGBA format
  getRandomColor(): string {
    return `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(
      Math.random() * 256
    )}, ${Math.floor(Math.random() * 256)}, 0.2)`;
  }

  //renderDoughnutChart method to render the doughnut chart
  renderDoughnutChart(chartData: any, canvas: CanvasWithChart): void {
    // Render the doughnut chart using your chart service
    this.generateChart(
      'doughnut',
      chartData.labels,
      chartData.datasets,
      canvas
    );
  }

  setBarChartRef(canvas: ElementRef) {
    console.log('barChartRefSetter called');
    this.barChartRef = canvas;
  }
  // Modify renderBarChart method to handle multiple budgets
  renderBarChart(chartData: any | any[], canvas: CanvasWithChart): void {
    // Extract labels and datasets from chartData
    const labels = ['Total Expenses'];

    const datasets = chartData.datasets.map((budget: any) => ({
      label: budget.label,
      data: budget.data,
      backgroundColor: this.generateRandomColors(1),
    }));

    // console.log('Labels RENDER BAR CHART:', labels);
    // console.log('Datasets RENDER BAR CHART:', datasets);

    // Render the bar chart using your chart service
    this.generateBarChart('bar', labels, datasets, canvas);
  }

  generateBarChart(
    chartType: keyof ChartTypeRegistry,
    labels: string[],
    datasets: any[],
    canvas: CanvasWithChart
  ): void {
    // Check if the canvas element is provided
    if (!canvas) {
      console.error('Canvas element not provided.');
      return;
    }

    // Destroy the existing chart if present
    if (canvas['data-chart']) {
      canvas['data-chart'].destroy();
    }

    // Get the 2D context of the canvas
    const ctx = canvas.getContext('2d');

    // Check if the canvas context is available
    if (!ctx) {
      console.error('Canvas context not available.');
      return;
    }

    // console.log('Labels:', labels);
    // console.log('Datasets:', datasets);

    try {
      // Create a new Chart instance
      const newChart = new Chart(ctx, {
        type: chartType,
        data: {
          labels: labels,
          datasets: datasets,
        },
        options: {
          
          plugins: {
            title: {
              display: true,
              text: 'All budgets Expenses',
              font: {
                size: 16,
              },
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  label += `€${context.parsed.y}`;
                  return label;
                }
              }
            }
          }
        },
      });

      // Save the Chart instance in the 'data-chart' property of the canvas
      canvas['data-chart'] = newChart;
    //  console.log('Chart instance:', canvas['data-chart']);
    } catch (error) {
      console.error('Error creating Chart:', error);
    }
  }

  // Generate a new Chart using the provided chartType, labels, datasets, and canvas
  generateChart(
    chartType: keyof ChartTypeRegistry,
    labels: string[],
    datasets: any[],
    canvas: CanvasWithChart
  ): void {
    // Check if the canvas element is provided
    if (!canvas) {
      console.error('Canvas element not provided.');
      return;
    }

    // Destroy the existing chart if present
    if (canvas['data-chart']) {
      canvas['data-chart'].destroy();
    }

    // Get the 2D context of the canvas
    const ctx = canvas.getContext('2d');

    // Check if the canvas context is available
    if (!ctx) {
      console.error('Canvas context not available.');
      return;
    }

    const newChart = new Chart(ctx, {
      type: chartType,
      data: {
        labels: labels,
        datasets: datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Expenses by Category',
            font: {
              size: 16,
            },
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                // Adjusting how the value is accessed based on the dataset structure
                let value = context.raw ?? context.parsed.y;
                label += `€${value}`;
                return label;
              }
            }
          }
        }
      }
    });

    // Save the Chart instance in the 'data-chart' property of the canvas
    canvas['data-chart'] = newChart;
  }

}
