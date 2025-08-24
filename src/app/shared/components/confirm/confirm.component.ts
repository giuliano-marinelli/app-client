import { NgTemplateOutlet } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output, TemplateRef, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { NgOtpInputComponent } from 'ng-otp-input';

import { CheckUserPassword, CheckUserVerificationCode, UpdateUserVerificationCode } from '../../entities/user.entity';

import { InvalidFeedbackComponent } from '../invalid-feedback/invalid-feedback.component';

import { AuthService } from '../../../services/auth.service';
import { MessagesService } from '../../../services/messages.service';

import { VarDirective } from '../../directives/var.directive';

@Component({
  selector: 'confirm',
  templateUrl: './confirm.component.html',
  imports: [
    FormsModule,
    InvalidFeedbackComponent,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    NgOtpInputComponent,
    NgTemplateOutlet,
    ReactiveFormsModule,
    VarDirective
  ]
})
export class ConfirmComponent {
  _auth: AuthService = inject(AuthService);
  _messages: MessagesService = inject(MessagesService);
  _formBuilder: FormBuilder = inject(FormBuilder);
  _dialog: MatDialog = inject(MatDialog);
  _checkUserPassword: CheckUserPassword = inject(CheckUserPassword);
  _checkUserVerificationCode: CheckUserVerificationCode = inject(CheckUserVerificationCode);
  _updateUserVerificationCode: UpdateUserVerificationCode = inject(UpdateUserVerificationCode);

  @Input() confirmMessage = 'Are you sure you want to do this?';
  @Input() confirmTemplate: TemplateRef<any> | null = null;
  @Input() confirmData?: any;
  @Input() confirmActionButton = 'Proceed';
  @Input() confirmColor = 'error';
  @Input() rejectActionButton = 'Cancel';
  @Input() requiredPassword = false;
  @Input() requiredPasswordMessage = 'Please enter your password to confirm.';
  @Input() requiredPasswordTemplate: TemplateRef<any> | null = null;
  @Input() requiredPasswordData?: any;
  @Input() confirmActionButtonPassword = 'Proceed';
  @Input() onlyPassword = false;
  @Input() requiredVerificationCode = false;
  @Input() requiredVerificationCodeMessage =
    `Please enter the verification code sended to your primary email to confirm.`;
  @Input() requiredVerificationCodeTemplate: TemplateRef<any> | null = null;
  @Input() requiredVerificationCodeData?: any;
  @Input() requiredVerificationCodeUseDefaultTemplate = true;
  @Input() requiredVerificationCodeAdviceMessage =
    `We need to verify your identity before you can proceed. We will send a verification code to your primary email.
    Did you lost access to your primary email? Contact your email provider to recover your email account.`;
  @Input() requiredVerificationCodeAdviceTemplate: TemplateRef<any> | null = null;
  @Input() requiredVerificationCodeAdviceData?: any;
  @Input() requiredVerificationCodeAdviceUseDefaultTemplate = true;
  @Input() confirmActionButtonVerificationCode = 'Proceed';
  @Input() confirmActionButtonVerificationCodeAdvice = 'Send code';
  @Input() onlyVerificationCode = false;

  @Output() confirm = new EventEmitter();
  @Output() reject = new EventEmitter();

  @ViewChild('content', { static: false }) content?: TemplateRef<any>;
  @ViewChild('content_password', { static: false }) contentPassword?: TemplateRef<any>;
  @ViewChild('content_verification_code', { static: false }) contentVerificationCode?: TemplateRef<any>;
  @ViewChild('content_verification_code_advice', { static: false }) contentVerificationCodeAdvice?: TemplateRef<any>;
  @ViewChild('content_verification_code_advice_default_message', { static: false })
  contentVerificationCodeAdviceDefaultMessage?: TemplateRef<any>;

  checkPasswordLoading = false;
  checkVerificationCodeLoading = false;
  checkVerificationCodeAdviceLoading = false;

  dialogRef?: MatDialogRef<any> | null;

  passwordForm!: FormGroup;
  password = new FormControl('', [
    Validators.required,
    Validators.minLength(8),
    Validators.maxLength(100)
  ]);
  passwordStored?: string | null;

  verificationCodeForm!: FormGroup;
  verificationCode = new FormControl('', [
    Validators.required,
    Validators.minLength(6),
    Validators.maxLength(6)
  ]);
  verificationCodeStored?: string | null;

  @HostListener('mousedown')
  open() {
    if (this.onlyPassword) this.openPassword();
    else if (this.onlyVerificationCode) this.openVerificationCodeAdvice();
    else this.dialogRef = this._dialog.open(this.content!);
  }

  openPassword() {
    this.dialogRef = this._dialog.open(this.contentPassword!, { disableClose: true });
    this.passwordForm = this._formBuilder.group({
      password: this.password
    });
  }

  openVerificationCodeAdvice() {
    this.dialogRef = this._dialog.open(this.contentVerificationCodeAdvice!, { disableClose: true });
  }

  openVerificationCode() {
    this.dialogRef = this._dialog.open(this.contentVerificationCode!, { disableClose: true });
    this.verificationCodeForm = this._formBuilder.group({
      verificationCode: this.verificationCode
    });
  }

  confirmAction() {
    if (this.requiredPassword) {
      this.dialogRef?.close();
      this.openPassword();
    } else if (this.requiredVerificationCode) {
      this.dialogRef?.close();
      this.openVerificationCodeAdvice();
    } else {
      this.dialogRef?.close();
      this.confirm?.emit();
    }
  }

  async confirmActionPassword() {
    if (await this.checkPassword()) {
      this.passwordStored = this.password?.value;
      this.passwordForm.reset();
      if (this.requiredVerificationCode) {
        this.dialogRef?.close();
        this.openVerificationCodeAdvice();
      } else {
        this.dialogRef?.close();
        this.confirm?.emit({ password: this.passwordStored });
      }
    }
  }

  async confirmActionVerificationCodeAdvice() {
    if (await this.sendVerificationCode()) {
      this.dialogRef?.close();
      this.openVerificationCode();
    }
  }

  async confirmActionVerificationCode() {
    if (await this.checkVerificationCode()) {
      this.verificationCodeStored = this.verificationCode?.value;
      this.verificationCodeForm.reset();
      this.dialogRef?.close();
      this.confirm?.emit({
        verificationCode: this.verificationCodeStored,
        ...(this.passwordStored ? { password: this.passwordStored } : {})
      });
    }
  }

  rejectAction() {
    this.dialogRef?.close();
    this.reject?.emit();
  }

  async checkPassword(): Promise<boolean> {
    return new Promise((resolve) => {
      this.checkPasswordLoading = true;
      if (this._auth.user) {
        this._checkUserPassword
          .fetch({ id: this._auth.user.id, password: this.password?.value })
          .subscribe({
            next: ({ data, errors }) => {
              if (errors) this._messages.error(errors, 'Could not check password. Please try again later.');
              else if (data?.checkUserPassword) resolve(true);
              else {
                this._messages.error('Password does not match.');
                resolve(false);
              }
            }
          })
          .add(() => {
            this.checkPasswordLoading = false;
          });
      } else {
        resolve(false);
      }
    });
  }

  async checkVerificationCode(): Promise<boolean> {
    return new Promise((resolve) => {
      this.checkVerificationCodeLoading = true;
      if (this._auth.user) {
        this._checkUserVerificationCode
          .fetch({ id: this._auth.user.id, code: this.verificationCode?.value })
          .subscribe({
            next: ({ data, errors }) => {
              if (errors) {
                this._messages.error(errors, 'Could not check verification code. Please try again later.');
                resolve(false);
              } else if (data?.checkUserVerificationCode) resolve(true);
              else {
                this._messages.error('Verification code does not match.');
                resolve(false);
              }
            }
          })
          .add(() => {
            this.checkVerificationCodeLoading = false;
          });
      } else {
        resolve(false);
      }
    });
  }

  async sendVerificationCode() {
    return new Promise((resolve) => {
      this.checkVerificationCodeAdviceLoading = true;
      if (this._auth.user) {
        this._updateUserVerificationCode
          .mutate({ id: this._auth.user.id })
          .subscribe({
            next: ({ errors }) => {
              if (errors) {
                this._messages.error(errors, 'Could not send verification code. Please try again later.');
                resolve(false);
              } else {
                this._messages.info('Verification code sent to your primary email.');
                resolve(true);
              }
            }
          })
          .add(() => {
            this.checkVerificationCodeAdviceLoading = false;
          });
      } else {
        resolve(false);
      }
    });
  }

  confirmMessageType(): string {
    if (this.confirmTemplate) return 'template';
    else return 'text';
  }

  requiredPasswordMessageType(): string {
    if (this.requiredPasswordMessage) return 'text';
    else return 'template';
  }

  requiredVerificationCodeMessageType(): string {
    if (this.requiredVerificationCodeUseDefaultTemplate) return 'template';
    else return 'text';
  }

  requiredVerificationCodeAdviceMessageType(): string {
    if (this.requiredVerificationCodeAdviceUseDefaultTemplate) return 'template';
    else return 'text';
  }
}
