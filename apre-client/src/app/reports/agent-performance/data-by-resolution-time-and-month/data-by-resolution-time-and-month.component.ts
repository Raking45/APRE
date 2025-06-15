/**
 * Author: Robert King
 * Date: June 12, 2025
 * Task: M-096
 * File: data-by-resolution-time-and-month.component.ts
 * Description: Component to display agent resolution time by month.
 */

// Angular core and common dependencies
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

// Reusable UI components
import { TableComponent } from '../../../shared/table/table.component';


@Component({
  selector: 'app-data-by-resolution-time-and-month',
  standalone: true,
  imports: [TableComponent, ReactiveFormsModule],
  template: `
    <section class="report-container">
      <h1 class="title">Agent Resolution Time by Month</h1>

      <form [formGroup]="resolutionForm" (ngSubmit)="onSubmit()" class="form">
        <div class="form__group">
          <label for="agent" class="form__label">Select Agent</label>
          <select formControlName="agent" id="agent" name="agent" class="form__select" required>
            <option value="" disabled selected>Select an Agent</option>
            @for (agent of agents; track agent) {
              <option [ngValue]="agent">{{ agent.name }}</option>
            }
          </select>
        </div>

        <div class="form__actions">
            <button type="submit" class="button button--primary">Generate Report</button>
        </div>
      </form>

      @if (resolutionData.length > 0) {
        <div class="table-wrapper card chart-card">
          <app-table
            [title] = "'Agent Resolution Time by Month'"
            [data] = "resolutionData"
            [headers] = "['Agent Name', 'Month', 'Year', 'Average Resolution Time']"
            [sortableColumns] = "['Month', 'Year']"
            [headerBackground] = "'secondary'"
            />
        </div>
      }
    </section>
  `,
  styles: [`
    .report-container {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .title {
      text-align: center;
      font-size: 2rem;
      margin-bottom: 1.5rem;
    }

    .form, .chart-card {
      width: 50%;
      margin: 20px 0;
      padding: 10px;
    }

    .form__label {
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .form__select {
      padding: 0.5rem;
      font-size: 1rem;
    }

    .table-wrapper {
      text-align: center;
    }

    app-table {
      padding: 50px;
    }
  `]
})
export class DataByResolutionTimeAndMonthComponent {
  agents: { name: string }[] = [];
  resolutionData: any[] = [];

  resolutionForm = this.fb.group({
    agent: [null as { name: string } | null, Validators.required]
  });

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.http.get<{ agents: { name: string }[] }>(
      `${environment.apiBaseUrl}/reports/agent-performance/agent-names`
    ).subscribe({
      next: (res) => {
        this.agents = res.agents.map(agent => ({
          name: agent.name,
        }));
      },
      error: (err) => {
        console.error('Failed to fetch agents', err);
      }
    });
  }

  onSubmit() {
    const selectedAgent = this.resolutionForm.controls['agent'].value as { name: string };

    if (!selectedAgent) return;

    const agentName = selectedAgent.name;

    this.http.get<{ results: any[] }>(
      `${environment.apiBaseUrl}/reports/agent-performance/resolution-time-by-month?agentName=${agentName}`
    ).subscribe({
      next: (res) => {
        this.resolutionData = (res.results || []).map(row => ({
          'Agent Name': agentName,
          'Month': this.getMonthName(row.month),
          'Year': row.year,
          'Average Resolution Time': row.avgResolutionTime?.toFixed(2) ?? ''
        }));
      },
      error: (err) => {
        console.error('Failed to fetch resolution data', err);
      }
    });
  }

  public getMonthName(month: number): string {
    return [
      '', 'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ][month] || '';
  }
}
