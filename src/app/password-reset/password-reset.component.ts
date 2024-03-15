import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable } from '@apollo/client';
import { CustomValidators } from '@narik/custom-validators';

import { ResetUserPassword, UpdateUserPasswordCode } from '../shared/entities/user.entity';
import { Global } from '../shared/global/global';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { MessagesService } from '../services/messages.service';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss']
})
export class PasswordResetComponent implements OnInit {
  @ViewChild('message_container') messageContainer!: ElementRef;

  submitLoading: boolean = false;

  setValid: any = Global.setValid;

  forgotPasswordForm!: FormGroup;
  usernameOrEmail = new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(100)]);

  passwordResetForm!: FormGroup;
  password = new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]);
  confirmPassword = new FormControl('', [
    Validators.required,
    Validators.minLength(8),
    Validators.maxLength(100),
    CustomValidators.equalTo(this.password)
  ]);

  //router params
  code!: string;

  constructor(
    public auth: AuthService,
    public route: ActivatedRoute,
    public router: Router,
    public messages: MessagesService,
    public formBuilder: FormBuilder,
    private _updateUserPasswordCode: UpdateUserPasswordCode,
    private _resetUserPassword: ResetUserPassword
  ) {
    this.route.params.subscribe((params) => {
      this.code = params['code'];
    });
  }

  ngOnInit(): void {
    firstValueFrom(this.auth.logged).then((logged) => {
      if (logged) this.router.navigate(['/']);
    });

    this.forgotPasswordForm = this.formBuilder.group({
      usernameOrEmail: this.usernameOrEmail
    });

    this.passwordResetForm = this.formBuilder.group({
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
            if (errors)
              this.messages.error(errors, {
                close: false,
                onlyOne: true,
                displayMode: 'replace',
                target: this.messageContainer
              });
            else if (data?.updateUserPasswordCode) {
              this.messages.clear(this.messageContainer.nativeElement.id);
              this.messages.info(
                `A password reset email has been sent to your primary email, please check your inbox and SPAM folder.`,
                { timeout: 0 }
              );
            }
          }
        })
        .add(() => {
          this.submitLoading = false;
        });
    }
  }

  resetPassword(): void {
    this.passwordResetForm.markAllAsTouched();
    if (this.passwordResetForm.valid) {
      this.submitLoading = true;
      this._resetUserPassword
        .mutate({ code: this.code, newPassword: this.password.value })
        .subscribe({
          next: ({ data, errors }) => {
            if (errors)
              this.messages.error(errors, {
                close: false,
                onlyOne: true,
                displayMode: 'replace',
                target: this.messageContainer
              });
            else if (data?.resetUserPassword) {
              this.messages.clear(this.messageContainer.nativeElement.id);
              this.messages.info(`Your password has been reset, please sign in with your new password.`, {
                timeout: 0
              });
              this.router.navigate(['/login']);
            }
          }
        })
        .add(() => {
          this.submitLoading = false;
        });
    }
  }
}
