import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { MessagesService } from '../services/messages.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  @ViewChild('message_container') messageContainer!: ElementRef;

  submitLoading: boolean = false;

  loginForm!: UntypedFormGroup;
  usernameOrEmail = new UntypedFormControl('', [
    Validators.required,
    Validators.minLength(4),
    Validators.maxLength(100)
  ]);
  password = new UntypedFormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(30)]);

  constructor(
    public auth: AuthService,
    public router: Router,
    public formBuilder: UntypedFormBuilder,
    public messages: MessagesService
  ) {}

  ngOnInit(): void {
    this.auth.isLoggedIn.subscribe({
      next: (loggedUser) => {
        if (loggedUser) this.router.navigate(['/']);
      }
    });

    this.loginForm = this.formBuilder.group({
      usernameOrEmail: this.usernameOrEmail,
      password: this.password
    });
  }

  setValid(control: UntypedFormControl): object {
    return {
      'is-invalid': control.dirty && !control.valid,
      'is-valid': control.dirty && control.valid
    };
  }

  login(): void {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.valid) {
      this.submitLoading = true;
      this.auth
        .login(this.loginForm.value)
        .then((loggedUser) => this.messages.success('Welcome, ' + loggedUser.username + '!'))
        .catch((error) =>
          this.messages.error(error, {
            close: false,
            onlyOne: true,
            displayMode: 'replace',
            target: this.messageContainer
          })
        )
        .finally(() => (this.submitLoading = false));
    } else {
      this.messages.error('Some values are invalid, please check.', ['login']);
    }
  }
}
