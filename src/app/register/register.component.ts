import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { CustomValidators } from '@narik/custom-validators';

import { ExtraValidators } from '../shared/validators/validators';
import { Observable } from 'rxjs';

import { User } from '../shared/models/user.model';

import { AuthService } from '../services/auth.service';
import { MessagesService } from '../services/messages.service';
import { UsersService } from '../services/users.service';

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
    [ExtraValidators.usernameExists(this.usersService)]
  );
  email = new FormControl(
    '',
    [Validators.required, Validators.maxLength(100), ExtraValidators.email],
    [ExtraValidators.emailExists(this.usersService)]
  );
  password = new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]);
  confirmPassword = new FormControl('', [
    Validators.required,
    Validators.minLength(8),
    Validators.maxLength(30),
    CustomValidators.equalTo(this.password)
  ]);

  constructor(
    public auth: AuthService,
    public router: Router,
    public formBuilder: FormBuilder,
    public usersService: UsersService,
    public messages: MessagesService
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
      this.usersService
        .create(createUserInput)
        .subscribe({
          next: (res) => {
            this.registerForm.markAsPristine();
            const loginInput = {
              usernameOrEmail: this.registerForm.value.username,
              password: this.registerForm.value.password
            };
            this.auth.login(loginInput).then((loggedUser) => this.sendVerificationEmail(res.data.createUser));
            this.messages.success('You successfully registered.');
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
    this.usersService.updateVerificationCode(user).subscribe({
      next: (res) => {
        this.messages.info('A verification email has been sent, please check your inbox and SPAM.', { timeout: 0 });
      },
      error: (error) => {
        this.messages.error(error);
      }
    });
  }
}
