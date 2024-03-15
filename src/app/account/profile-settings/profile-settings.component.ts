import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { CustomValidators } from '@narik/custom-validators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { createMask } from '@ngneat/input-mask';

import { Email } from '../../shared/entities/email.entity';
import { FindUser, UpdateUser, User } from '../../shared/entities/user.entity';
import { Global } from '../../shared/global/global';
import { NgxImageCompressService } from 'ngx-image-compress';
import { ImageCroppedEvent, base64ToFile } from 'ngx-image-cropper';
import { Observable } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { MessagesService } from '../../services/messages.service';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.scss']
})
export class ProfileSettingsComponent implements OnInit {
  @ViewChild('message_container') messageContainer!: ElementRef;
  @ViewChild('avatar_img') avatarImage!: ElementRef;

  userLoading: boolean = true;
  submitLoading: boolean = false;

  user?: User;

  setValid: any = Global.setValid;
  compareById: any = Global.compareById;

  profileForm!: FormGroup;
  id: any;
  name = new FormControl('', [Validators.maxLength(30), Validators.pattern('[a-zA-Z0-9\\s]*')]);
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
  location = new FormControl('', [Validators.maxLength(30), Validators.pattern('[a-zA-Z0-9,\\s]*')]);
  avatar = new FormControl('', []);
  avatarFile = new FormControl<Blob | null>(null, []);
  avatarChangedEvent!: Event;

  constructor(
    public auth: AuthService,
    public router: Router,
    public formBuilder: FormBuilder,
    public messages: MessagesService,
    private modalService: NgbModal,
    private compressor: NgxImageCompressService,
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
            if (errors)
              this.messages.error(errors, {
                onlyOne: true,
                displayMode: 'replace',
                target: this.messageContainer
              });
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
        .mutate(
          { userUpdateInput: this.profileForm.value, avatarFile: this.avatarFile.value },
          { context: { useMultipart: true } }
        )
        .subscribe({
          next: ({ data, errors }) => {
            if (errors)
              this.messages.error(errors, {
                close: false,
                onlyOne: true,
                displayMode: 'replace',
                target: this.messageContainer
              });
            if (data?.updateUser) {
              this.profileForm.markAsPristine();
              this.getUser();
              this.auth.setUser();
              this.messages.success('Profile settings successfully saved.', {
                onlyOne: true,
                displayMode: 'replace'
                // target: this.messageContainer
              });
            }
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

  onChangeAvatar(event: any, cropModal: any): void {
    if (event.target.files[0]) {
      this.modalService.open(cropModal, { centered: true });
      this.avatarChangedEvent = event;
    }
  }

  async onCroppedAvatar(event: ImageCroppedEvent): Promise<void> {
    if (event.base64) {
      const compressedImage = await this.compressor.compressFile(event.base64, 0, 50, 50, 500, 500); // 50% ration, 50% quality, 500x500px max size
      this.avatarFile.setValue(base64ToFile(compressedImage));
      this.avatarFile.markAsDirty();
      this.avatarImage.nativeElement.src = event.base64;
    }
  }
}
