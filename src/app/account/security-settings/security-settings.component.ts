import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { CustomValidators } from '@narik/custom-validators';

import { FindUser, UpdateUserPassword, User } from '../../shared/entities/user.entity';
import { Global } from '../../shared/global/global';
import { Observable } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { MessagesService } from '../../services/messages.service';

@Component({
  selector: 'app-security-settings',
  templateUrl: './security-settings.component.html',
  styleUrls: ['./security-settings.component.scss']
})
export class SecuritySettingsComponent implements OnInit {
  @ViewChild('message_container_update') messageContainerUpdate!: ElementRef;
  @ViewChild('message_container_two_factor') messageContainerDelete!: ElementRef;

  userLoading: boolean = true;
  updateSubmitLoading: boolean = false;

  user?: User;

  setValid: any = Global.setValid;

  passwordForm!: FormGroup;
  id: any;
  oldPassword = new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]);
  newPassword = new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]);
  confirmNewPassword = new FormControl('', [
    Validators.required,
    Validators.minLength(8),
    Validators.maxLength(30),
    CustomValidators.equalTo(this.newPassword)
  ]);
  constructor(
    public auth: AuthService,
    public router: Router,
    public messages: MessagesService,
    public formBuilder: FormBuilder,
    private _findUser: FindUser,
    private _updateUserPassword: UpdateUserPassword
  ) {}

  @HostListener('window:beforeunload', ['$event'])
  canDeactivate(): Observable<boolean> | boolean {
    return !this.hasChanges();
  }

  hasChanges(): boolean {
    return this.passwordForm.dirty;
  }

  ngOnInit(): void {
    this.passwordForm = this.formBuilder.group({
      id: this.id,
      oldPassword: this.oldPassword,
      newPassword: this.newPassword,
      confirmNewPassword: this.confirmNewPassword
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
              this.passwordForm.patchValue(data?.user);
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

  updatePassword(): void {
    if (this.auth.user) {
      this.passwordForm.markAllAsTouched();
      if (this.passwordForm.valid) {
        this.updateSubmitLoading = true;
        this._updateUserPassword
          .mutate({ id: this.auth.user.id, password: this.oldPassword.value, newPassword: this.newPassword.value })
          .subscribe({
            next: ({ data, errors }) => {
              if (errors)
                this.messages.error(errors, {
                  close: false,
                  onlyOne: true,
                  displayMode: 'replace',
                  target: this.messageContainerUpdate
                });
              if (data?.updateUserPassword) {
                this.passwordForm.reset();
                this.messages.success('Password successfully changed.', {
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
    } else {
      this.router.navigate(['/']);
    }
  }
}
