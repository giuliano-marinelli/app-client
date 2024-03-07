import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { CustomValidators } from '@narik/custom-validators';

import { CreateUser, FindUsers, Login, UpdateUserVerificationCode, User } from '../shared/entities/user.entity';
import { Global } from '../shared/global/global';
import { ExtraValidators } from '../shared/validators/validators';
import { Apollo } from 'apollo-angular';
import { Observable, firstValueFrom } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { MessagesService } from '../services/messages.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent implements OnInit {
  @ViewChild('message_container') messageContainer!: ElementRef;

  submitLoading: boolean = false;
  emailCheckingLoading: boolean = false;
  usernameCheckingLoading: boolean = false;

  setValid: any = Global.setValid;

  registerForm!: FormGroup;
  username = new FormControl(
    '',
    [Validators.required, Validators.minLength(4), Validators.maxLength(30), Validators.pattern('[a-zA-Z0-9_-]*')],
    [ExtraValidators.usernameExists(this._findUsers)]
  );
  email = new FormControl(
    '',
    [Validators.required, Validators.maxLength(100), ExtraValidators.email],
    [ExtraValidators.emailExists(this._findUsers)]
  );
  password = new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]);
  confirmPassword = new FormControl('', [
    Validators.required,
    Validators.minLength(8),
    Validators.maxLength(30),
    CustomValidators.equalTo(this.password)
  ]);

  constructor(
    public apollo: Apollo,
    public auth: AuthService,
    public router: Router,
    public formBuilder: FormBuilder,
    public messages: MessagesService,
    private _createUser: CreateUser,
    private _updateUserVerificationCode: UpdateUserVerificationCode,
    private _findUsers: FindUsers,
    private _login: Login
  ) {}

  @HostListener('window:beforeunload', ['$event'])
  canDeactivate(): Observable<boolean> | boolean {
    return !this.hasChanges();
  }

  hasChanges(): boolean {
    return this.registerForm.dirty;
  }

  ngOnInit(): void {
    firstValueFrom(this.auth.logged).then((logged) => {
      if (logged) this.router.navigate(['/']);
    });

    this.registerForm = this.formBuilder.group({
      username: this.username,
      email: this.email,
      password: this.password,
      confirmPassword: this.confirmPassword
    });
  }

  register(): void {
    this.registerForm.markAllAsTouched();
    if (this.registerForm.valid) {
      const userCreateInput = {
        username: this.registerForm.value.username,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password
      };
      this.submitLoading = true;
      this._createUser.mutate({ userCreateInput: userCreateInput }).subscribe({
        next: ({ data, errors }) => {
          if (errors) {
            this.messages.error(errors, {
              close: false,
              onlyOne: true,
              displayMode: 'replace',
              target: this.messageContainer
            });
            this.submitLoading = false;
          }
          if (data?.createUser) {
            this.registerForm.markAsPristine();
            const loginInput = {
              usernameOrEmail: this.registerForm.value.username,
              password: this.registerForm.value.password
            };
            this._login.fetch(loginInput).subscribe({
              next: ({ data, errors }) => {
                if (errors) {
                  this.messages.error(errors, {
                    close: false,
                    onlyOne: true,
                    displayMode: 'replace',
                    target: this.messageContainer
                  });
                  this.submitLoading = false;
                }
                if (data?.login) {
                  this.auth.setToken(data.login);
                  this.auth
                    .setUser()
                    ?.subscribe({
                      next: ({ data, errors }: any) => {
                        if (errors) {
                          this.messages.error(errors, {
                            close: false,
                            onlyOne: true,
                            displayMode: 'replace',
                            target: this.messageContainer
                          });
                        }
                        if (data?.user) {
                          this.sendVerificationEmail(data?.user);
                          this.messages.success('You successfully registered.');
                          this.router.navigate(['/']);
                        }
                      }
                    })
                    .add(() => {
                      this.submitLoading = false;
                    });
                }
              },
              error: () => {
                this.submitLoading = false;
              }
            });
          }
        },
        error: () => {
          this.submitLoading = false;
        }
      });
    } else {
      this.messages.error('Some values are invalid, please check.', {
        close: false,
        onlyOne: true,
        displayMode: 'replace',
        target: this.messageContainer
      });
    }
  }

  sendVerificationEmail(user: User): void {
    this._updateUserVerificationCode.mutate({ id: user.id }).subscribe({
      next: ({ data, errors }) => {
        if (errors) this.messages.error(errors);
        else if (data?.updateUserVerificationCode)
          this.messages.info(
            'A verification email has been sent, please check your inbox and SPAM in order to verify your account.',
            { timeout: 0 }
          );
      }
    });
  }
}
