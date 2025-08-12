import { Component, HostListener, OnInit } from '@angular/core';
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

import { CustomValidators } from '@narik/custom-validators';

import { CheckEmailAddressExists, CreateEmail, DeleteEmail, Email, UpdateEmailVerificationCode } from '../../shared/entities/email.entity';
import { FindUser, UpdateUserPrimaryEmail, User } from '../../shared/entities/user.entity';
import { Global } from '../../shared/global/global';
import { ExtraValidators } from '../../shared/validators/validators';
import { Observable } from 'rxjs';

import { ConfirmComponent } from '../../shared/components/confirm/confirm.component';
import { InvalidFeedbackComponent } from '../../shared/components/invalid-feedback/invalid-feedback.component';

import { AuthService } from '../../services/auth.service';
import { MessagesService } from '../../services/messages.service';

@Component({
  selector: 'settings-emails',
  templateUrl: './settings-emails.component.html',
  styleUrls: ['./settings-emails.component.scss'],
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
    ReactiveFormsModule
  ]
})
export class SettingsEmailsComponent implements OnInit {
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
    public formBuilder: FormBuilder,
    public messages: MessagesService,
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
      address: new FormControl('', this.addEmailValidator, [ExtraValidators.emailExists(this._checkEmailAddressExists, true)])
    });

    this.primaryEmailForm = this.formBuilder.group({ address: new FormControl('', this.primaryEmailValidator) });

    this.getUser();
  }

  getUser(): void {
    if (this.auth.user) {
      this.userLoading = true;
      this._findUser({ relations: { emails: true } })
        .fetch({ id: this.auth.user.id })
        .subscribe({
          next: ({ data, errors }: any) => {
            if (errors) {
              this.messages.error(errors, 'Could not fetch user data. Please try again later.');
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
      this.router.navigate(['/']);
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
              this.messages.error(errors, 'Could not add email. Please try again later.');
            }
            if (data?.createEmail) {
              this.addEmailForm.reset();
              this.getUser();
              this.auth.setUser();
              this.messages.info(`Email ${data.createEmail.address} successfully added.`);
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
            this.messages.error(errors, 'Could not remove email. Please try again later.');
          }
          if (data?.deleteEmail) {
            this.getUser();
            this.auth.setUser();
            this.messages.info(`Email ${email.address} successfully removed.`);
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
              this.messages.error(errors, 'Could not change primary email. Please try again later.');
            }
            if (data?.updateUserPrimaryEmail) {
              this.getUser();
              this.auth.setUser();
              this.messages.info('Primary email successfully changed.');
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
            `A verification email has been sent to ${email.address}, please check your inbox and SPAM in order to verify your account.`
          );
      }
    });
  }
}
