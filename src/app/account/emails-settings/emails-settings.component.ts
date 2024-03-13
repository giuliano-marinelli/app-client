import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { CustomValidators } from '@narik/custom-validators';

import {
  CheckEmailAddressExists,
  CreateEmail,
  DeleteEmail,
  Email,
  UpdateEmailVerificationCode
} from '../../shared/entities/email.entity';
import { FindUser, UpdateUserPrimaryEmail, User } from '../../shared/entities/user.entity';
import { Global } from '../../shared/global/global';
import { ExtraValidators } from '../../shared/validators/validators';
import { Observable } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { MessagesService } from '../../services/messages.service';

@Component({
  selector: 'app-emails-settings',
  templateUrl: './emails-settings.component.html',
  styleUrls: ['./emails-settings.component.scss']
})
export class EmailsSettingsComponent implements OnInit {
  @ViewChild('message_container') messageContainer!: ElementRef;
  @ViewChild('message_container_add_email') messageContainerAddEmail!: ElementRef;
  @ViewChild('message_container_primary_email') messageContainerPrimaryEmail!: ElementRef;

  userLoading: boolean = true;
  addEmailSubmitLoading: boolean = false;
  removeEmailSubmitLoading?: string | null;
  primaryEmailSubmitLoading: boolean = false;

  user?: User;
  get addEmailValidator() {
    return [
      Validators.required,
      Validators.maxLength(100),
      ExtraValidators.email,
      CustomValidators.notIncludedIn(this.user?.emails?.map((email) => email.address) as any[])
    ];
  }

  get primaryEmailValidator() {
    return [Validators.required, ExtraValidators.notEqual(this.user?.primaryEmail)];
  }

  setValid: any = Global.setValid;
  compareById: any = Global.compareById;

  addEmailForm!: FormGroup;

  get addEmailAddress() {
    return this.addEmailForm.get('address');
  }

  primaryEmailForm!: FormGroup;

  get primaryEmailAddress() {
    return this.primaryEmailForm.get('address');
  }

  constructor(
    public auth: AuthService,
    public router: Router,
    public messages: MessagesService,
    public formBuilder: FormBuilder,
    private _findUser: FindUser,
    private _checkEmailAddressExists: CheckEmailAddressExists,
    private _createEmail: CreateEmail,
    private _deleteEmail: DeleteEmail,
    private _updateUserPrimaryEmail: UpdateUserPrimaryEmail,
    private _updateEmailVerificationCode: UpdateEmailVerificationCode
  ) {}

  @HostListener('window:beforeunload', ['$event'])
  canDeactivate(): Observable<boolean> | boolean {
    return !this.hasChanges();
  }

  hasChanges(): boolean {
    return this.addEmailForm.dirty;
  }

  ngOnInit(): void {
    this.addEmailForm = this.formBuilder.group({
      address: new FormControl('', this.addEmailValidator, [
        ExtraValidators.emailExists(this._checkEmailAddressExists, true)
      ])
    });

    this.primaryEmailForm = this.formBuilder.group({
      address: new FormControl('', this.primaryEmailValidator)
    });

    this.getUser();
  }

  getUser(): void {
    if (this.auth.user) {
      this.userLoading = true;
      this._findUser({ relations: { emails: true } })
        .fetch({ id: this.auth.user.id })
        .subscribe({
          next: ({ data, errors }: any) => {
            if (errors)
              this.messages.error(errors, {
                onlyOne: true,
                displayMode: 'replace',
                target: this.messageContainer
              });
            if (data?.user) {
              this.user = data?.user;
              this.addEmailAddress?.setValidators(this.addEmailValidator);
              this.addEmailAddress?.updateValueAndValidity();
              this.primaryEmailAddress?.setValidators(this.primaryEmailValidator);
              this.primaryEmailAddress?.updateValueAndValidity();
              this.primaryEmailAddress?.setValue(this.user?.primaryEmail);
            }
          }
        })
        .add(() => {
          this.userLoading = false;
        });
    } else {
      this.router.navigate(['/']);
    }
  }

  addEmail(): void {
    this.addEmailForm.markAllAsTouched();
    if (this.addEmailForm.valid) {
      this.addEmailSubmitLoading = true;
      this._createEmail
        .mutate({
          emailCreateInput: {
            address: this.addEmailAddress?.value,
            user: { id: this.user?.id }
          }
        })
        .subscribe({
          next: ({ data, errors }) => {
            if (errors) {
              this.messages.error(errors, {
                close: false,
                onlyOne: true,
                displayMode: 'replace',
                target: this.messageContainerAddEmail
              });
            }
            if (data?.createEmail) {
              this.addEmailForm.reset();
              this.getUser();
              this.auth.setUser();
              this.messages.success(`Email ${data.createEmail.address} successfully added.`, {
                onlyOne: true,
                displayMode: 'replace'
                // target: this.messageContainer
              });
            }
          }
        })
        .add(() => {
          this.addEmailSubmitLoading = false;
        });
    }
  }

  removeEmail({ password, verificationCode }: any, email: Email): void {
    console.log('removeEmail', password, verificationCode, email);
    this.removeEmailSubmitLoading = email.id;
    this._deleteEmail
      .mutate({
        id: email.id,
        password,
        code: verificationCode
      })
      .subscribe({
        next: ({ data, errors }) => {
          if (errors) {
            this.messages.error(errors, {
              close: false,
              onlyOne: true,
              displayMode: 'replace',
              target: this.messageContainer
            });
          }
          if (data?.deleteEmail) {
            this.getUser();
            this.auth.setUser();
            this.messages.success(`Email ${email.address} successfully removed.`, {
              onlyOne: true,
              displayMode: 'replace'
              // target: this.messageContainer
            });
          }
        }
      })
      .add(() => {
        this.removeEmailSubmitLoading = null;
      });
  }

  changePrimaryEmail({ password, verificationCode }: any): void {
    this.primaryEmailForm.markAllAsTouched();
    if (this.primaryEmailForm.valid) {
      this.primaryEmailSubmitLoading = true;
      this._updateUserPrimaryEmail
        .mutate({
          id: this.user?.id,
          password,
          code: verificationCode,
          email: { id: this.primaryEmailAddress?.value?.id }
        })
        .subscribe({
          next: ({ data, errors }) => {
            if (errors) {
              this.messages.error(errors, {
                close: false,
                onlyOne: true,
                displayMode: 'replace',
                target: this.messageContainerPrimaryEmail
              });
            }
            if (data?.updateUserPrimaryEmail) {
              this.getUser();
              this.auth.setUser();
              this.messages.success('Primary email successfully changed.', {
                onlyOne: true,
                displayMode: 'replace'
                // target: this.messageContainer
              });
            }
          }
        })
        .add(() => {
          this.primaryEmailSubmitLoading = false;
        });
    }
  }

  sendVerificationEmail(email: Email): void {
    this._updateEmailVerificationCode.mutate({ id: email.id }).subscribe({
      next: ({ data, errors }) => {
        if (errors) this.messages.error(errors);
        else if (data?.updateEmailVerificationCode)
          this.messages.info(
            `A verification email has been sent to <b>${email.address}</b>, please check your inbox and SPAM in order to verify your account.`
          );
      }
    });
  }
}
