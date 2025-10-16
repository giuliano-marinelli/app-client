import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  inject
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { TranslocoModule, TranslocoService, translate } from '@jsverse/transloco';

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
    TranslocoModule,
    VarDirective
  ]
})
export class ConfirmComponent implements OnInit {
  _auth: AuthService = inject(AuthService);
  _messages: MessagesService = inject(MessagesService);
  _formBuilder: FormBuilder = inject(FormBuilder);
  _transloco: TranslocoService = inject(TranslocoService);
  _dialog: MatDialog = inject(MatDialog);
  _checkUserPassword: CheckUserPassword = inject(CheckUserPassword);
  _checkUserVerificationCode: CheckUserVerificationCode = inject(CheckUserVerificationCode);
  _updateUserVerificationCode: UpdateUserVerificationCode = inject(UpdateUserVerificationCode);

  @Input() confirmMessage?: string;
  @Input() confirmTemplate: TemplateRef<any> | null = null;
  @Input() confirmData?: any;
  @Input() confirmActionButton?: string;
  @Input() confirmColor = 'error';
  @Input() rejectActionButton?: string;
  @Input() requiredPassword = false;
  @Input() requiredPasswordMessage?: string;
  @Input() requiredPasswordTemplate: TemplateRef<any> | null = null;
  @Input() requiredPasswordData?: any;
  @Input() confirmActionButtonPassword?: string;
  @Input() onlyPassword = false;
  @Input() requiredVerificationCode = false;
  @Input() requiredVerificationCodeMessage?: string;
  @Input() requiredVerificationCodeTemplate: TemplateRef<any> | null = null;
  @Input() requiredVerificationCodeData?: any;
  @Input() requiredVerificationCodeUseDefaultTemplate = true;
  @Input() requiredVerificationCodeAdviceMessage?: string;
  @Input() requiredVerificationCodeLostAccessMessage?: string;
  @Input() requiredVerificationCodeDidntReceiveMessage?: string;
  @Input() requiredVerificationCodeAdviceTemplate: TemplateRef<any> | null = null;
  @Input() requiredVerificationCodeAdviceData?: any;
  @Input() requiredVerificationCodeAdviceUseDefaultTemplate = true;
  @Input() confirmActionButtonVerificationCode?: string;
  @Input() confirmActionButtonVerificationCodeAdvice?: string;
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

  ngOnInit() {
    this._transloco.selectTranslation().subscribe(() => {
      if (!this.confirmMessage) this.confirmMessage = translate('shared.confirm.defaults.confirmMessage');
      if (!this.confirmActionButton)
        this.confirmActionButton = translate('shared.confirm.defaults.confirmActionButton');
      if (!this.rejectActionButton) this.rejectActionButton = translate('shared.confirm.defaults.rejectActionButton');
      if (!this.requiredPasswordMessage)
        this.requiredPasswordMessage = translate('shared.confirm.defaults.requiredPasswordMessage');
      if (!this.confirmActionButtonPassword)
        this.confirmActionButtonPassword = translate('shared.confirm.defaults.confirmActionButtonPassword');
      if (!this.requiredVerificationCodeMessage)
        this.requiredVerificationCodeMessage = translate('shared.confirm.defaults.requiredVerificationCodeMessage', {
          email: this._auth.user?.primaryEmail?.address
        });
      if (!this.requiredVerificationCodeAdviceMessage)
        this.requiredVerificationCodeAdviceMessage = translate(
          'shared.confirm.defaults.requiredVerificationCodeAdviceMessage'
        );
      if (!this.requiredVerificationCodeLostAccessMessage)
        this.requiredVerificationCodeLostAccessMessage = translate(
          'shared.confirm.defaults.requiredVerificationCodeLostAccessMessage'
        );
      if (!this.requiredVerificationCodeDidntReceiveMessage)
        this.requiredVerificationCodeDidntReceiveMessage = translate(
          'shared.confirm.defaults.requiredVerificationCodeDidntReceiveMessage'
        );
      if (!this.confirmActionButtonVerificationCode)
        this.confirmActionButtonVerificationCode = translate(
          'shared.confirm.defaults.confirmActionButtonVerificationCode'
        );
      if (!this.confirmActionButtonVerificationCodeAdvice)
        this.confirmActionButtonVerificationCodeAdvice = translate(
          'shared.confirm.defaults.confirmActionButtonVerificationCodeAdvice'
        );
    });
  }

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
          .fetch({ id: this._auth.user.id, password: this.password?.value } as any)
          .subscribe({
            next: ({ data, error }) => {
              if (error) {
                this._messages.error(translate('shared.confirm.messages.checkPasswordError'));
              } else if (data?.checkUserPassword) {
                resolve(true);
              } else {
                this._messages.error(translate('shared.confirm.messages.checkPasswordNotMatch'));
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
          .fetch({ id: this._auth.user.id, code: this.verificationCode?.value } as any)
          .subscribe({
            next: ({ data }) => {
              if (data?.checkUserVerificationCode) resolve(true);
              else {
                this._messages.error(translate('shared.confirm.messages.checkVerificationCodeNotMatch'));
                resolve(false);
              }
            },
            error: (error) => {
              this._messages.error(error, translate('shared.confirm.messages.checkVerificationCodeError'));
              resolve(false);
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
                this._messages.error(errors, translate('shared.confirm.messages.sendVerificationCodeError'));
                resolve(false);
              } else {
                this._messages.info(translate('shared.confirm.messages.sendVerificationCodeSuccess'));
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
