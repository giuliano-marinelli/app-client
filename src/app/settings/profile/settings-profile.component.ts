import { Component, HostListener, OnInit } from '@angular/core';
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

import { FindUser, UpdateUser, User } from '../../shared/entities/user.entity';
import { Global } from '../../shared/global/global';
import { Observable } from 'rxjs';

import { InvalidFeedbackComponent } from '../../shared/components/invalid-feedback/invalid-feedback.component';
import { PictureInputComponent } from '../../shared/components/picture-input/picture-input.component';

import { AuthService } from '../../services/auth.service';
import { MessagesService } from '../../services/messages.service';

import { FilterPipe } from '../../shared/pipes/filter.pipe';

@Component({
  selector: 'settings-profile',
  templateUrl: './settings-profile.component.html',
  styleUrls: ['./settings-profile.component.scss'],
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
  userLoading: boolean = true;
  submitLoading: boolean = false;

  user?: User;

  setValid: any = Global.setValid;
  compareById: any = Global.compareById;

  profileForm!: FormGroup;
  id: any;
  name = new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(30), Validators.pattern('[a-zA-Z0-9\\s]*')]);
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
  location = new FormControl('', [Validators.maxLength(100), Validators.pattern('[a-zA-Z0-9,\\s]*')]);
  avatar = new FormControl('', []);
  avatarFile = new FormControl<Blob | null>(null, []);

  constructor(
    public auth: AuthService,
    public router: Router,
    public formBuilder: FormBuilder,
    public messages: MessagesService,
    private _findUser: FindUser,
    private _updateUser: UpdateUser
  ) {}

  @HostListener('window:beforeunload', ['$event'])
  canDeactivate(): Observable<boolean> | boolean {
    return !this.hasChanges();
  }

  hasChanges(): boolean {
    return this.profileForm.dirty;
  }

  ngOnInit(): void {
    this.profileForm = this.formBuilder.group({
      id: this.id,
      profile: this.formBuilder.group({
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
    if (this.auth.user) {
      this.userLoading = true;
      this._findUser({ relations: { emails: true } })
        .fetch({ id: this.auth.user?.id })
        .subscribe({
          next: ({ data, errors }: any) => {
            if (errors) {
              this.messages.error(errors, 'Could not fetch user data. Please try again later.');
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
      this.router.navigate(['/']);
    }
  }

  updateUser(): void {
    this.profileForm.markAllAsTouched();
    if (this.profileForm.valid) {
      this.submitLoading = true;
      this._updateUser
        .mutate({ userUpdateInput: this.profileForm.value, avatarFile: this.avatarFile.value }, { context: { useMultipart: true } })
        .subscribe({
          next: ({ data, errors }) => {
            if (errors) {
              this.messages.error(errors, 'Could not update user data. Please try again later.');
            }
            if (data?.updateUser) {
              this.profileForm.markAsPristine();
              this.getUser();
              this.auth.setUser();
              this.messages.info('Profile settings successfully saved.');
            }
          }
        })
        .add(() => {
          this.submitLoading = false;
        });
    } else {
      this.messages.error('Some values are invalid, please check.');
    }
  }
}
