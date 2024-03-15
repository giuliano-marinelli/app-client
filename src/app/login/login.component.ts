import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Login } from '../shared/entities/user.entity';
import { Global } from '../shared/global/global';
import { firstValueFrom } from 'rxjs';

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

  setValid: any = Global.setValid;

  loginForm!: FormGroup;
  usernameOrEmail = new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(100)]);
  password = new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]);

  constructor(
    public auth: AuthService,
    public router: Router,
    public messages: MessagesService,
    public formBuilder: FormBuilder,
    private _login: Login
  ) {}

  ngOnInit(): void {
    firstValueFrom(this.auth.logged).then((logged) => {
      if (logged) this.router.navigate(['/']);
    });

    this.loginForm = this.formBuilder.group({
      usernameOrEmail: this.usernameOrEmail,
      password: this.password
    });
  }

  login(): void {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.valid) {
      this.submitLoading = true;
      this._login.fetch(this.loginForm.value).subscribe({
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
                    this.messages.success(
                      'Welcome, ' + (data.user?.profile?.name ? data.user?.profile?.name : data.user?.username) + '!'
                    );
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
    } else {
      this.messages.error('Some values are invalid, please check.', {
        close: false,
        onlyOne: true,
        displayMode: 'replace',
        target: this.messageContainer
      });
    }
  }
}
