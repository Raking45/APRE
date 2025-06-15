import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DataByResolutionTimeAndMonthComponent } from './data-by-resolution-time-and-month.component';

describe('DataByResolutionTimeAndMonthComponent', () => {
  let component: DataByResolutionTimeAndMonthComponent;
  let fixture: ComponentFixture<DataByResolutionTimeAndMonthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, DataByResolutionTimeAndMonthComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataByResolutionTimeAndMonthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Test 1: Should display the title
  it('should display the title "Agent Resolution Time by Month"', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const titleElement = compiled.querySelector('h1');
    expect(titleElement).toBeTruthy();
    expect(titleElement?.textContent).toContain('Agent Resolution Time by Month');
  });

  // Test 2: Should have a disabled default agent option in dropdown
  it('should have a disabled default agent option in dropdown', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const selectElement = compiled.querySelector('select');
    const defaultOption = selectElement?.querySelector('option:disabled');

    expect(selectElement).toBeTruthy();
    expect(defaultOption).toBeTruthy();
    expect(defaultOption?.textContent).toContain('Select an Agent');
  });
  
  // Test 3: Should have a required validator on the agent form control
  it('should have a required validator on the agent form control', () => {
    const control = component.resolutionForm.get('agent');
    control?.setValue(null);
    expect(control?.valid).toBeFalse();

    control?.setValue({ name: 'Agent Smith'});
    expect(control?.valid).toBeTrue();
  });
});
