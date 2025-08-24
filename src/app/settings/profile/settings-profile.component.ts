import { Component, HostListener, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDivider, MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';

import { CustomValidators } from '@narik/custom-validators';
import { InputMaskModule, createMask } from '@ngneat/input-mask';

import { Global } from '../../shared/global/global';
import { Observable } from 'rxjs';

import { FindUser, UpdateUser, User } from '../../shared/entities/user.entity';

import { InvalidFeedbackComponent } from '../../shared/components/invalid-feedback/invalid-feedback.component';
import { PictureInputComponent } from '../../shared/components/picture-input/picture-input.component';

import { AuthService } from '../../services/auth.service';
import { MessagesService } from '../../services/messages.service';

import { FilterPipe } from '../../shared/pipes/filter.pipe';

@Component({
  selector: 'settings-profile',
  templateUrl: './settings-profile.component.html',
  imports: [
    FormsModule,
    FilterPipe,
    InputMaskModule,
    InvalidFeedbackComponent,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    PictureInputComponent,
    ReactiveFormsModule,
    RouterLink,
    MatDivider
  ]
})
export class SettingsProfileComponent implements OnInit {
  _auth: AuthService = inject(AuthService);
  _router: Router = inject(Router);
  _messages: MessagesService = inject(MessagesService);
  _formBuilder: FormBuilder = inject(FormBuilder);
  _findUser: FindUser = inject(FindUser);
  _updateUser: UpdateUser = inject(UpdateUser);

  userLoading = true;
  submitLoading = false;

  user?: User;

  compareById: any = Global.compareById;

  profileForm!: FormGroup;
  id: any;
  name = new FormControl('', [
    Validators.required,
    Validators.minLength(2),
    Validators.maxLength(30),
    Validators.pattern('[a-zA-Z0-9\\s]*')
  ]);
  publicEmail = new FormControl('', [Validators.required]);
  bio = new FormControl('', [
    Validators.maxLength(200)
    // Validators.pattern('[a-zA-Z0-9,;\.\/_-\\s]*')
  ]);
  url = new FormControl('', [
    Validators.maxLength(200),
    CustomValidators.url
    // Validators.pattern('[a-zA-Z0-9,;\.\/_-\\s]*')
  ]);
  urlMask = createMask({ alias: 'url' });
  location = new FormControl('', [
    Validators.maxLength(100),
    Validators.pattern('[a-zA-Z0-9,\\s]*')
  ]);
  avatar = new FormControl('', []);
  avatarFile = new FormControl<Blob | null>(null, []);

  @HostListener('window:beforeunload', ['$event'])
  canDeactivate(): Observable<boolean> | boolean {
    return !this.hasChanges();
  }

  hasChanges(): boolean {
    return this.profileForm.dirty;
  }

  ngOnInit(): void {
    this.profileForm = this._formBuilder.group({
      id: this.id,
      profile: this._formBuilder.group({
        avatar: this.avatar,
        name: this.name,
        publicEmail: this.publicEmail,
        bio: this.bio,
        url: this.url,
        location: this.location
      })
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
              this.profileForm.patchValue(data?.user);
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

  updateUser(): void {
    this.profileForm.markAllAsTouched();
    if (this.profileForm.valid) {
      this.submitLoading = true;
      this._updateUser
        .mutate(
          { userUpdateInput: this.profileForm.value, avatarFile: this.avatarFile.value },
          { context: { useMultipart: true } }
        )
        .subscribe({
          next: ({ data, errors }) => {
            if (errors) {
              this._messages.error(errors, 'Could not update user data. Please try again later.');
            }
            if (data?.updateUser) {
              this.profileForm.markAsPristine();
              this.getUser();
              this._auth.setUser();
              this._messages.info('Profile settings successfully saved.');
            }
          }
        })
        .add(() => {
          this.submitLoading = false;
        });
    } else {
      this._messages.error('Some values are invalid, please check.');
    }
  }
}
