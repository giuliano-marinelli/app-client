import { Component, EventEmitter, HostListener, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { CheckUserPassword, CheckUserVerificationCode, UpdateUserVerificationCode } from '../../entities/user.entity';
import { Global } from '../../global/global';

import { AuthService } from '../../../services/auth.service';
import { MessagesService } from '../../../services/messages.service';

@Component({
  selector: '[confirm]',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss']
})
export class ConfirmComponent {
  @Input() confirmMessage: string = 'Are you sure you want to do this?';
  @Input() confirmTemplate: TemplateRef<any> | null = null;
  @Input() confirmData?: any;
  @Input() confirmActionButton: string = 'Proceed';
  @Input() confirmColor: string = 'danger';
  @Input() rejectActionButton: string = 'Cancel';
  @Input() requiredPassword: boolean = false;
  @Input() requiredPasswordMessage: string = 'Please enter your password to confirm.';
  @Input() requiredPasswordTemplate: TemplateRef<any> | null = null;
  @Input() requiredPasswordData?: any;
  @Input() confirmActionButtonPassword: string = 'Proceed';
  @Input() onlyPassword: boolean = false;
  @Input() requiredVerificationCode: boolean = false;
  @Input() requiredVerificationCodeMessage: string =
    `Please enter the verification code sended to your primary email to confirm.`;
  @Input() requiredVerificationCodeTemplate: TemplateRef<any> | null = null;
  @Input() requiredVerificationCodeData?: any;
  @Input() requiredVerificationCodeUseDefaultTemplate: boolean = true;
  @Input() requiredVerificationCodeAdviceMessage: string =
    `We need to verify your identity before you can proceed. We will send a verification code to your primary email.
    Did you lost access to your primary email? Contact your email provider to recover your email account.`;
  @Input() requiredVerificationCodeAdviceTemplate: TemplateRef<any> | null = null;
  @Input() requiredVerificationCodeAdviceData?: any;
  @Input() requiredVerificationCodeAdviceUseDefaultTemplate: boolean = true;
  @Input() confirmActionButtonVerificationCode: string = 'Proceed';
  @Input() confirmActionButtonVerificationCodeAdvice: string = 'Send verification code';
  @Input() onlyVerificationCode: boolean = false;

  @Output() confirm = new EventEmitter();
  @Output() reject = new EventEmitter();

  @ViewChild('content', { static: false }) content?: TemplateRef<any>;
  @ViewChild('content_password', { static: false }) contentPassword?: TemplateRef<any>;
  @ViewChild('content_verification_code', { static: false }) contentVerificationCode?: TemplateRef<any>;
  @ViewChild('content_verification_code_advice', { static: false }) contentVerificationCodeAdvice?: TemplateRef<any>;
  @ViewChild('content_verification_code_advice_default_message', { static: false })
  contentVerificationCodeAdviceDefaultMessage?: TemplateRef<any>;

  checkPasswordLoading: boolean = false;
  checkVerificationCodeLoading: boolean = false;
  checkVerificationCodeAdviceLoading: boolean = false;

  modal?: NgbModalRef;

  setValid: any = Global.setValid;

  passwordForm!: FormGroup;
  password = new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]);
  passwordStored?: string | null;

  verificationCodeForm!: FormGroup;
  verificationCode = new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]);
  verificationCodeStored?: string | null;

  constructor(
    public auth: AuthService,
    public messages: MessagesService,
    public formBuilder: FormBuilder,
    private modalService: NgbModal,
    private _checkUserPassword: CheckUserPassword,
    private _checkUserVerificationCode: CheckUserVerificationCode,
    private _updateUserVerificationCode: UpdateUserVerificationCode
  ) {}

  @HostListener('mousedown')
  open() {
    if (this.onlyPassword) this.openPassword();
    else if (this.onlyVerificationCode) this.openVerificationCodeAdvice();
    else this.modal = this.modalService.open(this.content);
  }

  openPassword() {
    this.modal = this.modalService.open(this.contentPassword);
    this.passwordForm = this.formBuilder.group({
      password: this.password
    });
  }

  openVerificationCodeAdvice() {
    this.modal = this.modalService.open(this.contentVerificationCodeAdvice);
  }

  openVerificationCode() {
    this.modal = this.modalService.open(this.contentVerificationCode);
    this.verificationCodeForm = this.formBuilder.group({
      verificationCode: this.verificationCode
    });
  }

  confirmAction() {
    if (this.requiredPassword) {
      this.modal?.close();
      this.openPassword();
    } else if (this.requiredVerificationCode) {
      this.modal?.close();
      this.openVerificationCodeAdvice();
    } else {
      this.modal?.close();
      this.confirm?.emit();
    }
  }

  async confirmActionPassword() {
    if (await this.checkPassword()) {
      this.passwordStored = this.password?.value;
      this.passwordForm.reset();
      if (this.requiredVerificationCode) {
        this.modal?.close();
        this.openVerificationCodeAdvice();
      } else {
        this.modal?.close();
        this.confirm?.emit({ password: this.passwordStored });
      }
    }
  }

  async confirmActionVerificationCodeAdvice() {
    if (await this.sendVerificationCode()) {
      this.modal?.close();
      this.openVerificationCode();
    }
  }

  async confirmActionVerificationCode() {
    if (await this.checkVerificationCode()) {
      this.verificationCodeStored = this.verificationCode?.value;
      this.verificationCodeForm.reset();
      this.modal?.close();
      this.confirm?.emit({
        verificationCode: this.verificationCodeStored,
        ...(this.passwordStored ? { password: this.passwordStored } : {})
      });
    }
  }

  rejectAction() {
    this.modal?.close();
    this.reject?.emit();
  }

  async checkPassword(): Promise<boolean> {
    return new Promise((resolve) => {
      this.checkPasswordLoading = true;
      if (this.auth.user) {
        this._checkUserPassword
          .fetch({ id: this.auth.user.id, password: this.password?.value })
          .subscribe({
            next: ({ data, errors }) => {
              const messageContainerPassword = document.getElementById('message_container_password');
              if (errors)
                this.messages.error(errors, {
                  close: false,
                  onlyOne: true,
                  displayMode: 'replace',
                  target: messageContainerPassword
                });
              else if (data?.checkUserPassword) resolve(true);
              else {
                this.messages.error("Password don't match.", {
                  close: false,
                  onlyOne: true,
                  displayMode: 'replace',
                  target: messageContainerPassword
                });
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
      if (this.auth.user) {
        this._checkUserVerificationCode
          .fetch({ id: this.auth.user.id, code: this.verificationCode?.value })
          .subscribe({
            next: ({ data, errors }) => {
              const messageContainerVerificationCode = document.getElementById('message_container_verification_code');
              if (errors) {
                this.messages.error(errors, {
                  close: false,
                  onlyOne: true,
                  displayMode: 'replace',
                  target: messageContainerVerificationCode
                });
                resolve(false);
              } else if (data?.checkUserVerificationCode) resolve(true);
              else {
                this.messages.error("Verification code don't match.", {
                  close: false,
                  onlyOne: true,
                  displayMode: 'replace',
                  target: messageContainerVerificationCode
                });
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
      if (this.auth.user) {
        this._updateUserVerificationCode
          .mutate({ id: this.auth.user.id })
          .subscribe({
            next: ({ data, errors }) => {
              const messageContainerVerificationCodeAdvice = document.getElementById(
                'message_container_verification_code_advice'
              );
              if (errors) {
                this.messages.error(errors, {
                  close: false,
                  onlyOne: true,
                  displayMode: 'replace',
                  target: messageContainerVerificationCodeAdvice
                });
                resolve(false);
              } else {
                this.messages.success('Verification code sended to your primary email.', {
                  onlyOne: true,
                  displayMode: 'replace',
                  target: messageContainerVerificationCodeAdvice
                });
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
