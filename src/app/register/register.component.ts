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

import { CustomValidators } from '@narik/custom-validators';

import { CheckEmailAddressExists, Email, UpdateEmailVerificationCode } from '../shared/entities/email.entity';
import { CheckUserUsernameExists, CreateUser, Login } from '../shared/entities/user.entity';
import { ExtraValidators } from '../shared/validators/validators';
import { Observable, firstValueFrom } from 'rxjs';

import { InvalidFeedbackComponent } from '../shared/components/invalid-feedback/invalid-feedback.component';

import { AuthService } from '../services/auth.service';
import { MessagesService } from '../services/messages.service';

import { VarDirective } from '../shared/directives/var.directive';

@Component({
  selector: 'register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
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
    VarDirective
  ]
})
export class RegisterComponent implements OnInit {
  auth: AuthService = inject(AuthService);
  formBuilder: FormBuilder = inject(FormBuilder);
  router: Router = inject(Router);
  messages: MessagesService = inject(MessagesService);
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
    [Validators.required, Validators.maxLength(100), ExtraValidators.email],
    [ExtraValidators.emailExists(this._checkEmailAddressExists)]
  );
  username = new FormControl(
    '',
    [Validators.required, Validators.minLength(4), Validators.maxLength(30), Validators.pattern('[a-zA-Z0-9_-]*')],
    [ExtraValidators.usernameExists(this._checkUsernameExists)]
  );
  password = new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]);
  confirmPassword = new FormControl('', [
    Validators.required,
    Validators.minLength(8),
    Validators.maxLength(100),
    CustomValidators.equalTo(this.password)
  ]);
  // profile attributes
  name = new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(30), Validators.pattern('[a-zA-Z0-9\\s]*')]);

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

    firstValueFrom(this.auth.logged).then((logged) => {
      if (logged) this.router.navigate(['/']);
    });

    this.registerForm = this.formBuilder.group({
      username: this.username,
      email: this.email,
      password: this.password,
      confirmPassword: this.confirmPassword,
      profile: this.formBuilder.group({
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
              this.messages.error(errors, 'Registration failed. Please check your inputs.');
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
                      this.messages.error(errors, 'Login failed. Please try again later.');
                      this.submitLoading = false;
                    }
                    if (data?.login) {
                      this.auth.setToken(data.login);
                      this.auth
                        .setUser()
                        ?.subscribe({
                          next: ({ data, errors }: any) => {
                            if (errors) {
                              this.messages.error(errors, 'Could not fetch user data. Please try again later.');
                            }
                            if (data?.user) {
                              this.sendVerificationEmail(data?.user?.primaryEmail);
                              this.messages.info('You successfully registered. A verification email has been sent to your email address.');
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
      this.messages.error('Some values are invalid, please check.');
    }
  }

  sendVerificationEmail(email: Email): void {
    this._updateEmailVerificationCode.mutate({ id: email.id }).subscribe({
      next: ({ data, errors }) => {
        if (errors) this.messages.error(errors);
        else if (data?.updateEmailVerificationCode)
          this.messages.info(
            `A verification email has been sent to ${email.address}, please check your inbox and SPAM in order to verify your account.`,
            { duration: 10000 }
          );
      }
    });
  }
}
