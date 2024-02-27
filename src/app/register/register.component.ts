import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { CustomValidators } from '@narik/custom-validators';

import { CreateUser, FindUsers, UpdateUserVerificationCode, User } from '../shared/entities/user.entity';
import { ExtraValidators } from '../shared/validators/validators';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';

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

  registerForm!: FormGroup;
  username = new FormControl(
    '',
    [Validators.required, Validators.minLength(4), Validators.maxLength(30), Validators.pattern('[a-zA-Z0-9_-]*')],
    [ExtraValidators.usernameExists(this.findUsers)]
  );
  email = new FormControl(
    '',
    [Validators.required, Validators.maxLength(100), ExtraValidators.email],
    [ExtraValidators.emailExists(this.findUsers)]
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
    public createUser: CreateUser,
    public updateUserVerificationCode: UpdateUserVerificationCode,
    public findUsers: FindUsers
  ) {}

  @HostListener('window:beforeunload', ['$event'])
  canDeactivate(): Observable<boolean> | boolean {
    return !this.hasChanges();
  }

  hasChanges(): boolean {
    return this.registerForm.dirty;
  }

  ngOnInit(): void {
    this.auth.isLoggedIn.subscribe({
      next: (loggedUser) => {
        if (loggedUser) this.router.navigate(['/']);
      }
    });

    this.registerForm = this.formBuilder.group({
      username: this.username,
      email: this.email,
      password: this.password,
      confirmPassword: this.confirmPassword
    });
  }

  setValid(control: FormControl): object {
    return {
      'is-invalid': control.dirty && !control.valid,
      'is-valid': control.dirty && control.valid
    };
  }

  register(): void {
    this.registerForm.markAllAsTouched();
    if (this.registerForm.valid) {
      this.submitLoading = true;
      const createUserInput = {
        username: this.registerForm.value.username,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password
      };
      this.createUser
        .mutate({ userCreateInput: createUserInput })
        .subscribe({
          next: ({ data }) => {
            if (data?.createUser) {
              this.registerForm.markAsPristine();
              const loginInput = {
                usernameOrEmail: this.registerForm.value.username,
                password: this.registerForm.value.password
              };
              this.auth.login(loginInput).then((loggedUser) => {
                this.sendVerificationEmail(data.createUser);
              });
              this.messages.success('You successfully registered.');
            }
          },
          error: (error) => {
            this.messages.error(error, {
              close: false,
              onlyOne: true,
              displayMode: 'replace',
              target: this.messageContainer
            });
          }
        })
        .add(() => {
          this.submitLoading = false;
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
    this.updateUserVerificationCode.mutate({ id: user.id }).subscribe({
      next: ({ data }) => {
        this.messages.info('A verification email has been sent, please check your inbox and SPAM.', { timeout: 0 });
      },
      error: (error) => {
        this.messages.error(error);
      }
    });
  }
}
