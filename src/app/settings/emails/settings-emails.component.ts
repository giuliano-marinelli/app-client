import { Component, HostListener, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';

import { TranslocoModule, translate } from '@jsverse/transloco';
import { CustomValidators } from '@narik/custom-validators';

import { Global } from '../../shared/global/global';
import { ExtraValidators } from '../../shared/validators/validators';
import { Observable } from 'rxjs';

import {
  CheckEmailAddressExists,
  CreateEmail,
  DeleteEmail,
  Email,
  UpdateEmailVerificationCode
} from '../../shared/entities/email.entity';
import { FindUser, UpdateUserPrimaryEmail, User } from '../../shared/entities/user.entity';

import { ConfirmComponent } from '../../shared/components/confirm/confirm.component';
import { InvalidFeedbackComponent } from '../../shared/components/invalid-feedback/invalid-feedback.component';

import { AuthService } from '../../services/auth.service';
import { MessagesService } from '../../services/messages.service';

@Component({
  selector: 'settings-emails',
  templateUrl: './settings-emails.component.html',
  imports: [
    ConfirmComponent,
    FormsModule,
    InvalidFeedbackComponent,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    ReactiveFormsModule,
    TranslocoModule
  ]
})
export class SettingsEmailsComponent implements OnInit {
  _auth: AuthService = inject(AuthService);
  _router: Router = inject(Router);
  _messages: MessagesService = inject(MessagesService);
  _formBuilder: FormBuilder = inject(FormBuilder);
  _findUser: FindUser = inject(FindUser);
  _checkEmailAddressExists: CheckEmailAddressExists = inject(CheckEmailAddressExists);
  _createEmail: CreateEmail = inject(CreateEmail);
  _deleteEmail: DeleteEmail = inject(DeleteEmail);
  _updateUserPrimaryEmail: UpdateUserPrimaryEmail = inject(UpdateUserPrimaryEmail);
  _updateEmailVerificationCode: UpdateEmailVerificationCode = inject(UpdateEmailVerificationCode);

  userLoading = true;
  addEmailSubmitLoading = false;
  removeEmailSubmitLoading?: string | null;
  primaryEmailSubmitLoading = false;

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
    return [
      Validators.required,
      ExtraValidators.notEqual(this.user?.primaryEmail)
    ];
  }

  compareById: any = Global.compareById;

  addEmailForm!: FormGroup;

  get addEmailAddress() {
    return this.addEmailForm.get('address');
  }

  primaryEmailForm!: FormGroup;

  get primaryEmailAddress() {
    return this.primaryEmailForm.get('address');
  }

  @HostListener('window:beforeunload', ['$event'])
  canDeactivate(): Observable<boolean> | boolean {
    return !this.hasChanges();
  }

  hasChanges(): boolean {
    return this.addEmailForm.dirty;
  }

  ngOnInit(): void {
    this.addEmailForm = this._formBuilder.group({
      address: new FormControl('', this.addEmailValidator, [ExtraValidators.emailExists(this._checkEmailAddressExists)])
    });

    this.primaryEmailForm = this._formBuilder.group({ address: new FormControl('', this.primaryEmailValidator) });

    this.getUser();
  }

  getUser(): void {
    if (this._auth.user) {
      this.userLoading = true;
      this._findUser({ relations: { emails: true } })
        .fetch({ id: this._auth.user.id })
        .subscribe({
          next: ({ data, errors }: any) => {
            if (errors) {
              this._messages.error(errors, translate('messages.fetchUserError'));
            }
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
      this._router.navigate(['/']);
    }
  }

  addEmail(): void {
    this.addEmailForm.markAllAsTouched();
    if (this.addEmailForm.valid) {
      this.addEmailSubmitLoading = true;
      this._createEmail
        .mutate({ emailCreateInput: { address: this.addEmailAddress?.value, user: { id: this.user?.id } } })
        .subscribe({
          next: ({ data, errors }) => {
            if (errors) {
              this._messages.error(errors, translate('settings.emails.messages.addEmailError'));
            }
            if (data?.createEmail) {
              this.addEmailForm.reset();
              this.getUser();
              this._auth.setUser();
              this._messages.info(
                translate('settings.emails.messages.addEmailSuccess', { email: data.createEmail.address })
              );
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
      .mutate({ id: email.id, password, code: verificationCode })
      .subscribe({
        next: ({ data, errors }) => {
          if (errors) {
            this._messages.error(
              errors,
              translate('settings.emails.messages.removeEmailError', { email: email.address })
            );
          }
          if (data?.deleteEmail) {
            this.getUser();
            this._auth.setUser();
            this._messages.info(translate('settings.emails.messages.removeEmailSuccess', { email: email.address }));
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
              this._messages.error(errors, translate('settings.emails.messages.changePrimaryEmailError'));
            }
            if (data?.updateUserPrimaryEmail) {
              this.getUser();
              this._auth.setUser();
              this._messages.info(translate('settings.emails.messages.changePrimaryEmailSuccess'));
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
        if (errors) this._messages.error(errors);
        else if (data?.updateEmailVerificationCode)
          this._messages.info(translate('settings.emails.messages.verificationEmail', { email: email.address }));
      }
    });
  }
}
