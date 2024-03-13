import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { CheckUserUsernameExists, DeleteUser, FindUser, UpdateUser, User } from '../../shared/entities/user.entity';
import { Global } from '../../shared/global/global';
import { ExtraValidators } from '../../shared/validators/validators';
import { Observable } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { MessagesService } from '../../services/messages.service';

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.scss']
})
export class AccountSettingsComponent implements OnInit {
  @ViewChild('message_container_update') messageContainerUpdate!: ElementRef;
  @ViewChild('message_container_delete') messageContainerDelete!: ElementRef;

  userLoading: boolean = true;
  updateSubmitLoading: boolean = false;
  deleteSubmitLoading: boolean = false;

  user?: User;

  setValid: any = Global.setValid;

  usernameForm!: FormGroup;
  id: any;
  username = new FormControl(
    '',
    [Validators.required, Validators.minLength(4), Validators.maxLength(30), Validators.pattern('[a-zA-Z0-9_-]*')],
    [ExtraValidators.usernameExists(this._usernameExists)]
  );
  constructor(
    public auth: AuthService,
    public router: Router,
    public messages: MessagesService,
    public formBuilder: FormBuilder,
    private _findUser: FindUser,
    private _usernameExists: CheckUserUsernameExists,
    private _updateUser: UpdateUser,
    private _deleteUser: DeleteUser
  ) {}

  @HostListener('window:beforeunload', ['$event'])
  canDeactivate(): Observable<boolean> | boolean {
    return !this.hasChanges();
  }

  hasChanges(): boolean {
    return this.usernameForm.dirty;
  }

  ngOnInit(): void {
    this.usernameForm = this.formBuilder.group({
      id: this.id,
      username: this.username
    });
    this.getUser();
  }

  getUser(): void {
    if (this.auth.user) {
      this.userLoading = true;
      this._findUser
        .fetch({ id: this.auth.user.id })
        .subscribe({
          next: ({ data, errors }) => {
            if (errors)
              this.messages.error(errors, {
                onlyOne: true,
                displayMode: 'replace',
                target: this.messageContainerUpdate
              });
            if (data?.user) {
              this.user = data?.user;
              this.usernameForm.patchValue(data?.user);
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

  updateUsername(): void {
    this.usernameForm.markAllAsTouched();
    if (this.usernameForm.valid) {
      this.updateSubmitLoading = true;
      this._updateUser
        .mutate({ userUpdateInput: this.usernameForm.value })
        .subscribe({
          next: ({ data, errors }) => {
            if (errors)
              this.messages.error(errors, {
                close: false,
                onlyOne: true,
                displayMode: 'replace',
                target: this.messageContainerUpdate
              });
            if (data?.updateUser) {
              this.usernameForm.markAsPristine();
              this.getUser();
              this.auth.setUser();
              this.messages.success('Username successfully changed.', {
                onlyOne: true,
                displayMode: 'replace'
                // target: this.messageContainerUpdate
              });
            }
          }
        })
        .add(() => {
          this.updateSubmitLoading = false;
        });
    } else {
      this.messages.error('Some values are invalid, please check.', {
        close: false,
        onlyOne: true,
        displayMode: 'replace',
        target: this.messageContainerUpdate
      });
    }
  }

  deleteUser({ password, verificationCode }: any): void {
    this.deleteSubmitLoading = true;
    if (this.auth.user) {
      this._deleteUser
        .mutate({ id: this.auth.user.id, password: password, code: verificationCode })
        .subscribe({
          next: ({ data, errors }) => {
            if (errors)
              this.messages.error(errors, {
                close: false,
                onlyOne: true,
                displayMode: 'replace',
                target: this.messageContainerDelete
              });
            if (data?.deleteUser) {
              this.auth.eraseToken();
              this.auth.setUser();
              this.messages.warning('Your account was successfully deleted. We will miss you!', { timeout: 0 });
            }
          }
        })
        .add(() => {
          this.deleteSubmitLoading = false;
        });
    } else {
      this.router.navigate(['/']);
    }
  }
}
