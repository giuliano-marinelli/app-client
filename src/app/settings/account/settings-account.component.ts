import { Component, HostListener, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';

import { ExtraValidators } from '../../shared/validators/validators';
import { Observable } from 'rxjs';

import { CheckUserUsernameExists, DeleteUser, FindUser, UpdateUser, User } from '../../shared/entities/user.entity';

import { ConfirmComponent } from '../../shared/components/confirm/confirm.component';
import { InvalidFeedbackComponent } from '../../shared/components/invalid-feedback/invalid-feedback.component';

import { AuthService } from '../../services/auth.service';
import { MessagesService } from '../../services/messages.service';

@Component({
  selector: 'settings-account',
  templateUrl: './settings-account.component.html',
  imports: [
    ConfirmComponent,
    FormsModule,
    InvalidFeedbackComponent,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule
  ]
})
export class SettingsAccountComponent implements OnInit {
  _auth: AuthService = inject(AuthService);
  _router: Router = inject(Router);
  _messages: MessagesService = inject(MessagesService);
  _formBuilder: FormBuilder = inject(FormBuilder);
  _findUser: FindUser = inject(FindUser);
  _usernameExists: CheckUserUsernameExists = inject(CheckUserUsernameExists);
  _updateUser: UpdateUser = inject(UpdateUser);
  _deleteUser: DeleteUser = inject(DeleteUser);

  userLoading = true;
  updateSubmitLoading = false;
  deleteSubmitLoading = false;

  user?: User;

  usernameForm!: FormGroup;
  id: any;
  username = new FormControl(
    '',
    [
      Validators.required,
      Validators.minLength(4),
      Validators.maxLength(30),
      Validators.pattern('[a-zA-Z0-9_-]*')
    ],
    [ExtraValidators.usernameExists(this._usernameExists)]
  );

  @HostListener('window:beforeunload', ['$event'])
  canDeactivate(): Observable<boolean> | boolean {
    return !this.hasChanges();
  }

  hasChanges(): boolean {
    return this.usernameForm.dirty;
  }

  ngOnInit(): void {
    this.usernameForm = this._formBuilder.group({
      id: this.id,
      username: this.username
    });
    this.getUser();
  }

  getUser(): void {
    if (this._auth.user) {
      this.userLoading = true;
      this._findUser({ relations: { emails: true } })
        .fetch({ id: this._auth.user?.id })
        .subscribe({
          next: ({ data, errors }: any) => {
            if (errors) {
              this._messages.error(errors, 'Could not fetch user data. Please try again later.');
            }
            if (data?.user) {
              this.user = data?.user;
              this.usernameForm.patchValue(data?.user);
              this.usernameForm.markAsPristine();
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

  updateUsername(): void {
    this.usernameForm.markAllAsTouched();
    if (this.usernameForm.valid) {
      this.updateSubmitLoading = true;
      this._updateUser
        .mutate({ userUpdateInput: this.usernameForm.value })
        .subscribe({
          next: ({ data, errors }) => {
            if (errors) {
              this._messages.error(errors, 'Could not update user data. Please try again later.');
            }
            if (data?.updateUser) {
              this.getUser();
              this._auth.setUser();
              this.usernameForm.markAsPristine();
              this._messages.info('Username successfully changed.');
            }
          }
        })
        .add(() => {
          this.updateSubmitLoading = false;
        });
    } else {
      this._messages.error('Some values are invalid, please check.');
    }
  }

  deleteUser({ password, verificationCode }: any): void {
    this.deleteSubmitLoading = true;
    if (this._auth.user) {
      this._deleteUser
        .mutate({ id: this._auth.user.id, password: password, code: verificationCode })
        .subscribe({
          next: ({ data, errors }) => {
            if (errors) {
              this._messages.error(errors, 'Could not delete user data. Please try again later.');
            }
            if (data?.deleteUser) {
              this._auth.eraseToken();
              this._auth.setUser();
              this._messages.info('Your account was successfully deleted. We will miss you!');
            }
          }
        })
        .add(() => {
          this.deleteSubmitLoading = false;
        });
    } else {
      this._router.navigate(['/']);
    }
  }
}
