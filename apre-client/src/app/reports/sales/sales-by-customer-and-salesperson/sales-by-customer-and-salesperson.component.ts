/**
 * Author: Robert King
 * Date: June 6, 2025
 * Task: M-076
 * File: sales-by-customer-and-salesperson.component.ts
 * Description: Component to display sales data by customer and salesperson.
 * This component fetches sales data from the API and displays it in either a chart or table format based on user selection.
 * It uses Angular's HttpClient for API calls and ChangeDetectorRef for manual change detection.
 * This component is designed to be responsive and user-friendly, allowing users to toggle between chart and table views.
 */

// Angular core and common dependencies
import { HttpClient } from '@angular/common/http';
import { Component, ChangeDetectorRef } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormsModule } from '@angular/forms';

// Reusable UI components
import { ChartComponent } from '../../../shared/chart/chart.component';
import { TableComponent } from '../../../shared/table/table.component';

// Component decorator definition
@Component({
  selector: 'app-sales-by-customer-and-salesperson',
  standalone: true,
  // Importing necessary modules and shared components
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ChartComponent, TableComponent],

  // Inline HTML Template
  template: `
  <div class="sales-layout">
    <!-- Page Title -->
    <h1>Sales by Customer and Salesperson</h1>

    <!-- View Mode Toggle (Chart/Table) -->
    <div class="toggle-container">
      <label>
        <input type="radio" name="view" value="chart" [(ngModel)]="viewMode" /> Chart
      </label>
      <label>
        <input type="radio" name="view" value="table" [(ngModel)]="viewMode" /> Table
      </label>
    </div>

    <!-- Chart View -->
    @if (viewMode === 'chart' && totalSales.length && salesPeople.length) {
      <div class="card chart-card responsive-chart">
        <app-chart
          [type]="'bar'"
          [label]="'Total Sales by Salesperson'"
          [data]="totalSales"
          [labels]="salesPeople">
        </app-chart>
      </div>
    }

    <!-- Table View -->
    @if (viewMode === 'table' && salesData.length > 0) {
      <div class="card chart-card responsive-table">
        <app-table
          [title]="'Sales by Customer and Salesperson'"
          [data]="salesData"
          [headers]="['Customer', 'Salesperson', 'Total Sales']"
          [sortableColumns]="['Salesperson', 'Total Sales']"
          [headerBackground]="'secondary'">
        </app-table>
      </div>
    }
  </div>
  `,
  // Component-scoped styles for layout and responsiveness
  styles: [`
    .sales-layout {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1rem;
      gap: 1.5rem;
    }

    h1 {
      text-align: center;
      font-size: 1.8rem;
    }

    .toggle-container {
      display: flex;
      justify-content: center;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .toggle-container label {
      font-weight: 500;
    }
    
    .chart-card,
    .responsive-chart,
    .responsive-table {
      width: 100%;
      max-width: 1000px;
      box-sizing: border-box;
    }

    app-chart {
      display: block;
      width: 100%;
      height: auto;
    }

    @media (max-width: 768px) {
      h1 {
        font-size: 1.4rem;
      }

      .toggle-container {
        flex-direction: column;
        align-items: center;
      }
      
      .chart-card {
        padding: 0.5rem;
      }
    }
  `]
})
export class SalesByCustomerAndSalespersonComponent {
  // Current view mode for 'chart' or 'table'
  viewMode: 'chart' | 'table' = 'chart';

  // Raw sales data for table
  salesData: any[] = [];
  // Processed data for chart and table
  totalSales: number[] = [];
  salesPeople: string[] = [];

  constructor(
    private http: HttpClient, // For API calls
    private cdr: ChangeDetectorRef  // For manually triggering change detection
  ) {
    // Fetch sales data when component initializes
    this.fetchSalesData();
  }

  /**
   * Fetch sales data grouped by customer and salesperson from the API.
   * Populates chart and table data, then triggers change detection.
   */
  fetchSalesData() {
    this.http.get<any []>(`${environment.apiBaseUrl}/reports/sales/customer-sales`).subscribe({
      // On successful response
      next: (data: any[]) => {
        // Combine customer and salesperson for chart labels
        this.salesPeople = data.map(d => `${d.customer} - ${d.salesperson}`);
        this.totalSales = data.map(d => d.totalSales);
        // Transform raw data to table format with readable headers
        this.salesData = data.map(d => ({
          Customer: d.customer,
          Salesperson: d.salesperson,
          'Total Sales': d.totalSales
      }));
        // Trigger UI update
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      // On error
      error: (err) => {
        console.error('Error fetching customer-sales data:', err);
      }
    });
  }
}