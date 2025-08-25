import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';

import { TranslocoModule, translate } from '@jsverse/transloco';
import { CustomValidators } from '@narik/custom-validators';

import { firstValueFrom } from 'rxjs';

import { ResetUserPassword, UpdateUserPasswordCode } from '../shared/entities/user.entity';

import { InvalidFeedbackComponent } from '../shared/components/invalid-feedback/invalid-feedback.component';

import { AuthService } from '../services/auth.service';
import { MessagesService } from '../services/messages.service';

import { VarDirective } from '../shared/directives/var.directive';

@Component({
  selector: 'password-reset',
  templateUrl: './password-reset.component.html',
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
    TranslocoModule,
    VarDirective
  ]
})
export class PasswordResetComponent implements OnInit {
  _auth: AuthService = inject(AuthService);
  _router: Router = inject(Router);
  _route: ActivatedRoute = inject(ActivatedRoute);
  _messages: MessagesService = inject(MessagesService);
  _formBuilder: FormBuilder = inject(FormBuilder);
  _breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  _updateUserPasswordCode: UpdateUserPasswordCode = inject(UpdateUserPasswordCode);
  _resetUserPassword: ResetUserPassword = inject(ResetUserPassword);

  // forgot password form
  forgotPasswordForm!: FormGroup;
  usernameOrEmail = new FormControl('', [
    Validators.required,
    Validators.minLength(4),
    Validators.maxLength(100)
  ]);

  // restore password form
  resetPasswordForm!: FormGroup;
  password = new FormControl('', [
    Validators.required,
    Validators.minLength(8),
    Validators.maxLength(100)
  ]);
  confirmPassword = new FormControl('', [
    Validators.required,
    Validators.minLength(8),
    Validators.maxLength(100),
    CustomValidators.equalTo(this.password)
  ]);

  submitLoading = false;

  // router param
  code!: string;

  $isSmallScreen = false;

  ngOnInit(): void {
    this._route.params.subscribe((params) => {
      this.code = params['code'];
    });

    this._breakpointObserver.observe([Breakpoints.XSmall]).subscribe((result) => {
      this.$isSmallScreen = result.matches;
    });

    firstValueFrom(this._auth.logged).then((logged) => {
      if (logged) this._router.navigate(['/']);
    });

    this.forgotPasswordForm = this._formBuilder.group({ usernameOrEmail: this.usernameOrEmail });

    this.resetPasswordForm = this._formBuilder.group({
      password: this.password,
      confirmPassword: this.confirmPassword
    });
  }

  sendPasswordResetEmail(): void {
    this.forgotPasswordForm.markAllAsTouched();
    if (this.forgotPasswordForm.valid) {
      this.submitLoading = true;
      this._updateUserPasswordCode
        .mutate({ usernameOrEmail: this.usernameOrEmail.value })
        .subscribe({
          next: ({ data, errors }) => {
            if (errors) {
              this._messages.error(errors, translate('passwordReset.forgotForm.messages.sendPasswordResetEmailError'));
            } else if (data?.updateUserPasswordCode) {
              this._messages.info(translate('passwordReset.forgotForm.messages.sendPasswordResetEmailSuccess'), {
                duration: 10000
              });
              this._router.navigate(['/login']);
            }
          }
        })
        .add(() => {
          this.submitLoading = false;
        });
    }
  }

  resetPassword(): void {
    this.resetPasswordForm.markAllAsTouched();
    if (this.resetPasswordForm.valid) {
      this.submitLoading = true;
      this._resetUserPassword
        .mutate({ code: this.code, newPassword: this.password.value })
        .subscribe({
          next: ({ data, errors }) => {
            if (errors) {
              this._messages.error(errors, translate('passwordReset.resetForm.messages.resetPasswordError'));
            } else if (data?.resetUserPassword) {
              this._messages.info(translate('passwordReset.resetForm.messages.resetPasswordSuccess'), {
                duration: 10000
              });
              this._router.navigate(['/login']);
            }
          }
        })
        .add(() => {
          this.submitLoading = false;
        });
    }
  }
}
