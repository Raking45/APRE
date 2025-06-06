/**
 * Author: Robert King
 * Date: June 6, 2025
 * Task: M-076 
 * File: sales-by-customer-and-salesperson.component.spec.ts
 * Description: Unit tests for the SalesByCustomerAndSalespersonComponent.
 * This file contains tests for the component's functionality, including rendering, data binding, and view toggling.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SalesByCustomerAndSalespersonComponent } from './sales-by-customer-and-salesperson.component';
import { By } from '@angular/platform-browser';

describe('SalesByCustomerAndSalespersonComponent', () => {
  let component: SalesByCustomerAndSalespersonComponent;
  let fixture: ComponentFixture<SalesByCustomerAndSalespersonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, SalesByCustomerAndSalespersonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesByCustomerAndSalespersonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  

  // General tests
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the title "Sales by Customer and Salesperson"', () => {
    const titleElement = fixture.nativeElement.querySelector('h1');
    expect(titleElement).toBeTruthy();
    expect(titleElement.textContent).toContain('Sales by Customer and Salesperson');
  });

  it('should default to chart view mode', () => {
    expect(component.viewMode).toBe('chart');
  });

  // Chart tests
  it('should render chart when viewMode is "chart" and data is present', () => {
    component.viewMode = 'chart';
    component.totalSales = [100, 200];
    component.salesPeople = ['Alice', 'Bob'];
    fixture.detectChanges();

    const chartComponent = fixture.debugElement.query(By.css('app-chart'));
    expect(chartComponent).toBeTruthy();
  });

  it('should bind correct inputs to chart component', () => {
    component.viewMode = 'chart';
    component.totalSales = [150, 250];
    component.salesPeople = ['Customer A - John', 'Customer B - Jane'];
    fixture.detectChanges();

    const chartComponent = fixture.debugElement.query(By.css('app-chart'));
    expect(chartComponent.componentInstance.data).toEqual([150, 250]);
    expect(chartComponent.componentInstance.labels).toEqual(['Customer A - John', 'Customer B - Jane']);
  });

  it('should not render chart if totalSales or salesPeople is empty', () => {
    component.viewMode = 'chart';
    component.totalSales = [];
    component.salesPeople = [];
    fixture.detectChanges();

    const chartComponent = fixture.debugElement.query(By.css('app-chart'));
    expect(chartComponent).toBeFalsy();
  });

  // Table tests
  it('should render table when viewMode is "table" and salesData is populated', () => {
    component.viewMode = 'table';
    component.salesData = [
      { Customer: 'Acme', Salesperson: 'John', 'Total Sales': 300 }
    ];
    fixture.detectChanges();

    const tableComponent = fixture.debugElement.query(By.css('app-table'));
    expect(tableComponent).toBeTruthy();
  });

  it('should bind correct headers to the table component', () => {
    component.viewMode = 'table';
    component.salesData = [
      { Customer: 'Beta', Salesperson: 'Jane', 'Total Sales': 150 }
    ];
    fixture.detectChanges();

    const tableComponent = fixture.debugElement.query(By.css('app-table'));
    expect(tableComponent.componentInstance.headers).toEqual(['Customer', 'Salesperson', 'Total Sales']);
    expect(tableComponent.componentInstance.data.length).toBe(1);
  });

  it('should not render table if salesData is empty', () => {
    component.viewMode = 'table';
    component.salesData = [];
    fixture.detectChanges();

    const tableComponent = fixture.debugElement.query(By.css('app-table'));
    expect(tableComponent).toBeFalsy();
  });
});
