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

import { TranslocoModule, translate } from '@jsverse/transloco';

import { firstValueFrom } from 'rxjs';

import { Login } from '../shared/entities/user.entity';

import { InvalidFeedbackComponent } from '../shared/components/invalid-feedback/invalid-feedback.component';

import { AuthService } from '../services/auth.service';
import { MessagesService } from '../services/messages.service';
import { TitleService } from '../services/title.service';

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
    TranslocoModule,
    VarDirective
  ]
})
export class LoginComponent implements OnInit {
  _auth: AuthService = inject(AuthService);
  _router: Router = inject(Router);
  _messages: MessagesService = inject(MessagesService);
  _title: TitleService = inject(TitleService);
  _formBuilder: FormBuilder = inject(FormBuilder);
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

    firstValueFrom(this._auth.logged).then((logged) => {
      if (logged) this._router.navigate(['/']);
    });

    this.loginForm = this._formBuilder.group({
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
            this._messages.error(errors, translate('login.messages.loginError'));
            this.submitLoading = false;
          }
          if (data?.login) {
            this._auth.setToken(data.login);
            this._auth
              .setUser()
              ?.subscribe({
                next: ({ data, errors }: any) => {
                  if (errors) {
                    this._messages.error(errors, translate('login.messages.loginError'));
                  }
                  if (data?.user) {
                    this._messages.info(
                      translate('login.messages.loginSuccess', {
                        userName: data.user?.profile?.name ? data.user?.profile?.name : data.user?.username
                      })
                    );
                    this._router.navigate(['/']);
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
      this._messages.error(translate('messages.invalidValues'));
    }
  }
}
