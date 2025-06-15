import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  template: `
    <div class="signin">
      <h1 class="signin__title">Sign In</h1>

      @if(errorMessage) {
        <div class="message message--error">{{ errorMessage }}</div>
      }

      <form [formGroup]="signinForm" (ngSubmit)="signin();" class="signin__form">
        <div class="signin__form-group">

          <!-- Task m-031: Add red asterisk to username label & required field indicator 6/10/2025 -->
          <label for="username" class="signin__label">Username <span class="asterisk">*</span></label>
          <!-- Task m-028: Add a placeholder to username input placeholder="Enter your username" 6/10/2025 -->
          <input id="username" formControlName="username" type="text" class="signin__input" placeholder="Enter your username" required />
        </div>

        <div class="signin__form-group">
          <!-- Task m-032: Add red asterisk to password label & required field indicator 6/10/2025 -->
          <label for="password" class="signin__label">Password <span class="asterisk">*</span></label>
          <!-- Task m-029: Add a placeholder to password input placeholder="Enter your password" 6/10/2025 -->
          <input id="password" formControlName="password" type="password" class="signin__input" placeholder="Enter your password" required />
        </div>

        <!-- Task m-030: Add a tooltip to submit button with text "Click to sign in" 6/10/2025
        Task m-033: Modify the submit button text to Sign in 6/10/2025 -->
        <input type="submit" class="signin__button" Value="Sign in" title="Click to sign in" />
      </form>
      <a href="/" class="signin__return-link">Return to Home</a>
      <p class="info"><span class="asterisk">*</span> Indicates a required field</p> 
    </div>
  `,
  styles: `
    .signin {
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      width: 30%;
      margin: 50px auto; /* Center the card */
      border: 1px solid #ddd; /* Add border */
      font-family: 'Roboto', sans-serif;
    }

    .signin__title {
      text-align: center;
    }

    .signin__form {
      display: flex;
      flex-direction: column;
    }

    .signin__form-group {
      margin-bottom: 15px;
    }

    .signin__label {
      margin-bottom: 5px;
    }

    /* Task m-031 added on 6/10/2025 */
    .signin__label .asterisk,
    p .asterisk {
      color: red; /* Red asterisk for required field */
    }

    /* Task m-031 (This was not required but implemented for UX/UI clarity) */
    .info {
      text-align: center;
    }

    .signin__input {
      padding: 8px;
      width: 100%;
      box-sizing: border-box;
      border: 1px solid #ccc; /* Default border color */
      border-radius: 4px;
    }

    .signin__input:focus {
      border-color: #20c997; /* Green border on focus */
      outline: none; /* Remove default outline */
    }

    .signin__button {
      padding: 10px;
      background-color: #20c997;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .signin__button:hover {
      background-color: #17a589;
    }

    .signin__return-link {
      display: block;
      text-align: center;
      margin-top: 15px;
      color: #20c997;
      text-decoration: none;
    }

    .signin__return-link:hover {
      text-decoration: underline;
    }
  `
})
export class SigninComponent {
  errorMessage: string;

  signinForm: FormGroup = this.fb.group({
    username: [null, Validators.compose([Validators.required])],
    password: [null, Validators.compose([Validators.required, Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}')])],
  });

  constructor(private http: HttpClient, private fb: FormBuilder, private router: Router, private cookieService: CookieService) {
    this.errorMessage = '';
  }

  signin() {
    const username = this.signinForm.controls['username'].value;
    const password = this.signinForm.controls['password'].value;

    if (!this.signinForm.valid) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    this.http.post(`${environment.apiBaseUrl}/security/signin`, { username, password }).subscribe({
      next: (response: any) => {
        console.log('Signin Response', response);

        const sessionUser = {
          username: response.username,
          role: response.role,
        }

        this.cookieService.set('sessionUser', JSON.stringify(sessionUser));

        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Signin Error', error);
        this.errorMessage = 'Invalid username or password'
      }
    });
  }
}
