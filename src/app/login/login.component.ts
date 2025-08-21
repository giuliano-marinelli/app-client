import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';

import { firstValueFrom } from 'rxjs';

import { Login } from '../shared/entities/user.entity';

import { InvalidFeedbackComponent } from '../shared/components/invalid-feedback/invalid-feedback.component';

import { AuthService } from '../services/auth.service';
import { MessagesService } from '../services/messages.service';

import { VarDirective } from '../shared/directives/var.directive';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  imports: [
    FormsModule,
    InvalidFeedbackComponent,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    RouterLink,
    VarDirective
  ]
})
export class LoginComponent implements OnInit {
  auth: AuthService = inject(AuthService);
  formBuilder: FormBuilder = inject(FormBuilder);
  router: Router = inject(Router);
  messages: MessagesService = inject(MessagesService);
  _breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  _login: Login = inject(Login);

  // login form
  loginForm!: FormGroup;
  usernameOrEmail = new FormControl('', [
    Validators.required,
    Validators.minLength(4),
    Validators.maxLength(100)
  ]);
  password = new FormControl('', [
    Validators.required,
    Validators.minLength(8),
    Validators.maxLength(100)
  ]);

  submitLoading = false;

  $isSmallScreen = false;

  ngOnInit(): void {
    this._breakpointObserver.observe([Breakpoints.XSmall]).subscribe((result) => {
      this.$isSmallScreen = result.matches;
    });

    firstValueFrom(this.auth.logged).then((logged) => {
      if (logged) this.router.navigate(['/']);
    });

    this.loginForm = this.formBuilder.group({
      usernameOrEmail: this.usernameOrEmail,
      password: this.password
    });
  }

  login(): void {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.valid) {
      this.submitLoading = true;
      this._login.fetch(this.loginForm.value).subscribe({
        next: ({ data, errors }) => {
          if (errors) {
            this.messages.error(errors, 'Login failed. Please check your credentials.');
            this.submitLoading = false;
          }
          if (data?.login) {
            this.auth.setToken(data.login);
            this.auth
              .setUser()
              ?.subscribe({
                next: ({ data, errors }: any) => {
                  if (errors) {
                    this.messages.error(errors, 'Login failed. Please check your credentials.');
                  }
                  if (data?.user) {
                    this.messages.info(
                      'Welcome, ' + (data.user?.profile?.name ? data.user?.profile?.name : data.user?.username) + '!'
                    );
                    this.router.navigate(['/']);
                  }
                }
              })
              .add(() => {
                this.submitLoading = false;
              });
          }
        },
        error: () => {
          this.submitLoading = false;
        }
      });
    } else {
      this.messages.error('Some values are invalid, please check.');
    }
  }
}
