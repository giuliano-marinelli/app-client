import { Component, HostListener, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';

import { TranslocoModule, translate } from '@jsverse/transloco';
import { CustomValidators } from '@narik/custom-validators';

import { Observable } from 'rxjs';

import { FindUser, UpdateUserPassword, User } from '../../shared/entities/user.entity';

import { InvalidFeedbackComponent } from '../../shared/components/invalid-feedback/invalid-feedback.component';

import { AuthService } from '../../services/auth.service';
import { MessagesService } from '../../services/messages.service';

import { VarDirective } from '../../shared/directives/var.directive';

@Component({
  selector: 'settings-security',
  templateUrl: './settings-security.component.html',
  imports: [
    FormsModule,
    InvalidFeedbackComponent,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    TranslocoModule,
    VarDirective
  ]
})
export class SettingsSecurityComponent implements OnInit {
  _auth: AuthService = inject(AuthService);
  _router: Router = inject(Router);
  _messages: MessagesService = inject(MessagesService);
  _formBuilder: FormBuilder = inject(FormBuilder);
  _findUser: FindUser = inject(FindUser);
  _updateUserPassword: UpdateUserPassword = inject(UpdateUserPassword);

  userLoading = true;
  updateSubmitLoading = false;

  user?: User;

  passwordForm!: FormGroup;
  id: any;
  oldPassword = new FormControl('', [
    Validators.required,
    Validators.minLength(8),
    Validators.maxLength(30)
  ]);
  newPassword = new FormControl('', [
    Validators.required,
    Validators.minLength(8),
    Validators.maxLength(30)
  ]);
  confirmNewPassword = new FormControl('', [
    Validators.required,
    Validators.minLength(8),
    Validators.maxLength(30),
    CustomValidators.equalTo(this.newPassword)
  ]);

  @HostListener('window:beforeunload', ['$event'])
  canDeactivate(): Observable<boolean> | boolean {
    return !this.hasChanges();
  }

  hasChanges(): boolean {
    return this.passwordForm.dirty;
  }

  ngOnInit(): void {
    this.passwordForm = this._formBuilder.group({
      id: this.id,
      oldPassword: this.oldPassword,
      newPassword: this.newPassword,
      confirmNewPassword: this.confirmNewPassword
    });
    this.getUser();
  }

  getUser(): void {
    if (this._auth.user) {
      this.userLoading = true;
      this._findUser
        .fetch({ id: this._auth.user.id })
        .subscribe({
          next: ({ data, error }) => {
            if (error) {
              this._messages.error(translate('messages.fetchUserError'));
            }
            if (data?.user) {
              this.user = data?.user as User;
              this.passwordForm.patchValue(data?.user);
              this.passwordForm.reset();
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

  updatePassword(): void {
    if (this._auth.user) {
      this.passwordForm.markAllAsTouched();
      if (this.passwordForm.valid) {
        this.updateSubmitLoading = true;
        this._updateUserPassword
          .mutate({ id: this._auth.user.id, password: this.oldPassword.value, newPassword: this.newPassword.value })
          .subscribe({
            next: ({ data, error }) => {
              if (error) {
                this._messages.error(translate('settings.security.messages.updatePasswordError'));
              }
              if (data?.updateUserPassword) {
                this.passwordForm.reset();
                this._messages.info(translate('settings.security.messages.updatePasswordSuccess'));
              }
            }
          })
          .add(() => {
            this.updateSubmitLoading = false;
          });
      } else {
        this._messages.error(translate('messages.invalidValues'));
      }
    } else {
      this._router.navigate(['/']);
    }
  }
}
