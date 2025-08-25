import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, HostListener, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';

import { TranslocoModule, translate } from '@jsverse/transloco';
import { CustomValidators } from '@narik/custom-validators';

import { ExtraValidators } from '../shared/validators/validators';
import { Observable, firstValueFrom } from 'rxjs';

import { CheckEmailAddressExists, Email, UpdateEmailVerificationCode } from '../shared/entities/email.entity';
import { CheckUserUsernameExists, CreateUser, Login } from '../shared/entities/user.entity';

import { InvalidFeedbackComponent } from '../shared/components/invalid-feedback/invalid-feedback.component';

import { AuthService } from '../services/auth.service';
import { MessagesService } from '../services/messages.service';

import { VarDirective } from '../shared/directives/var.directive';

@Component({
  selector: 'register',
  templateUrl: './register.component.html',
  imports: [
    FormsModule,
    InvalidFeedbackComponent,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    RouterLink,
    TranslocoModule,
    VarDirective
  ]
})
export class RegisterComponent implements OnInit {
  _auth: AuthService = inject(AuthService);
  _router: Router = inject(Router);
  _messages: MessagesService = inject(MessagesService);
  _formBuilder: FormBuilder = inject(FormBuilder);
  _breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  _createUser: CreateUser = inject(CreateUser);
  _checkUsernameExists: CheckUserUsernameExists = inject(CheckUserUsernameExists);
  _checkEmailAddressExists: CheckEmailAddressExists = inject(CheckEmailAddressExists);
  _updateEmailVerificationCode: UpdateEmailVerificationCode = inject(UpdateEmailVerificationCode);
  _login: Login = inject(Login);

  // register form
  registerForm!: FormGroup;
  email = new FormControl(
    '',
    [
      Validators.required,
      Validators.maxLength(100),
      ExtraValidators.email
    ],
    [ExtraValidators.emailExists(this._checkEmailAddressExists)]
  );
  username = new FormControl(
    '',
    [
      Validators.required,
      Validators.minLength(4),
      Validators.maxLength(30),
      Validators.pattern('[a-zA-Z0-9_-]*')
    ],
    [ExtraValidators.usernameExists(this._checkUsernameExists)]
  );
  password = new FormControl('', [
    Validators.required,
    Validators.minLength(8),
    Validators.maxLength(100)
  ]);
  confirmPassword = new FormControl('', [
    Validators.required,
    Validators.minLength(8),
    Validators.maxLength(100),
    CustomValidators.equalTo(this.password)
  ]);
  // profile attributes
  name = new FormControl('', [
    Validators.required,
    Validators.minLength(2),
    Validators.maxLength(30),
    Validators.pattern('[a-zA-Z0-9\\s]*')
  ]);

  submitLoading = false;
  emailCheckingLoading = false;
  usernameCheckingLoading = false;

  $isSmallScreen = false;

  @HostListener('window:beforeunload', ['$event'])
  canDeactivate(): Observable<boolean> | boolean {
    return !this.hasChanges();
  }

  hasChanges(): boolean {
    return this.registerForm.dirty;
  }

  ngOnInit(): void {
    this._breakpointObserver.observe([Breakpoints.XSmall]).subscribe((result) => {
      this.$isSmallScreen = result.matches;
    });

    firstValueFrom(this._auth.logged).then((logged) => {
      if (logged) this._router.navigate(['/']);
    });

    this.registerForm = this._formBuilder.group({
      username: this.username,
      email: this.email,
      password: this.password,
      confirmPassword: this.confirmPassword,
      profile: this._formBuilder.group({
        name: this.name
      })
    });
  }

  register(): void {
    this.registerForm.markAllAsTouched();
    if (this.registerForm.valid) {
      this.submitLoading = true;
      this._createUser
        .mutate({
          userCreateInput: {
            username: this.registerForm.value.username,
            email: this.registerForm.value.email,
            password: this.registerForm.value.password,
            profile: {
              name: this.registerForm.value.profile.name
            }
          }
        })
        .subscribe({
          next: ({ data, errors }) => {
            if (errors) {
              this._messages.error(errors, translate('register.messages.registerError'));
              this.submitLoading = false;
            }
            if (data?.createUser) {
              this.registerForm.markAsPristine();
              this._login
                .fetch({
                  usernameOrEmail: this.registerForm.value.username,
                  password: this.registerForm.value.password
                })
                .subscribe({
                  next: ({ data, errors }) => {
                    if (errors) {
                      this._messages.error(errors, translate('register.messages.loginError'));
                      this.submitLoading = false;
                    }
                    if (data?.login) {
                      this._auth.setToken(data.login);
                      this._auth
                        .setUser()
                        ?.subscribe({
                          next: ({ data, errors }: any) => {
                            if (errors) {
                              this._messages.error(errors, translate('messages.fetchUserError'));
                            }
                            if (data?.user) {
                              this.sendVerificationEmail(data?.user?.primaryEmail);
                              this._messages.info(translate('register.messages.registerSuccess'));
                              this._router.navigate(['/']);
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
      this._messages.error(translate('messages.invalidValues'));
    }
  }

  sendVerificationEmail(email: Email): void {
    this._updateEmailVerificationCode.mutate({ id: email.id }).subscribe({
      next: ({ data, errors }) => {
        if (errors) this._messages.error(errors);
        else if (data?.updateEmailVerificationCode)
          this._messages.info(translate('register.messages.verificationEmail', { email: email.address }), {
            duration: 10000
          });
      }
    });
  }
}
