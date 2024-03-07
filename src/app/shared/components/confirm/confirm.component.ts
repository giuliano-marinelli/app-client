import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { CheckPasswordUser } from '../../entities/user.entity';
import { Global } from '../../global/global';

import { AuthService } from '../../../services/auth.service';
import { MessagesService } from '../../../services/messages.service';

@Component({
  selector: '[confirm]',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss']
})
export class ConfirmComponent {
  @Input() confirmMessage: string = 'Are you sure you want to do this?';
  @Input() confirmTemplate: TemplateRef<any> | null = null;
  @Input() confirmData?: any;
  @Input() confirmActionButton: string = 'Proceed';
  @Input() rejectActionButton: string = 'Cancel';
  @Input() requiredPassword: boolean = false;
  @Input() requiredPasswordMessage: string = 'Please enter your password to confirm.';

  @Output() confirm = new EventEmitter();
  @Output() reject = new EventEmitter();

  @ViewChild('content', { static: false }) content?: TemplateRef<any>;
  @ViewChild('content_password', { static: false }) contentPassword?: TemplateRef<any>;

  checkPasswordLoading: boolean = false;

  modal?: NgbModalRef;

  setValid: any = Global.setValid;

  passwordForm!: UntypedFormGroup;
  password = new UntypedFormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(30)]);

  constructor(
    public auth: AuthService,
    public messages: MessagesService,
    public formBuilder: UntypedFormBuilder,
    private modalService: NgbModal,
    private _checkPasswordUser: CheckPasswordUser
  ) {}

  @HostListener('mousedown')
  open() {
    this.modal = this.modalService.open(this.content);
  }

  openPassword() {
    this.modal = this.modalService.open(this.contentPassword);
    this.passwordForm = this.formBuilder.group({
      password: this.password
    });
  }

  async confirmAction(requirePassword?: boolean) {
    if (requirePassword) {
      this.modal?.close();
      this.openPassword();
    } else if (!this.requiredPassword || (await this.checkPassword())) {
      this.modal?.close();
      this.confirm?.emit(this.passwordForm.value.password);
    }
  }

  rejectAction() {
    this.modal?.close();
    this.reject?.emit();
  }

  async checkPassword(): Promise<boolean> {
    return new Promise((resolve) => {
      this.checkPasswordLoading = true;
      if (this.auth.user) {
        this._checkPasswordUser
          .fetch({ id: this.auth.user.id, password: this.passwordForm.value.password })
          .subscribe({
            next: ({ data, errors }) => {
              const messageContainerPassword = document.getElementById('message_container_password');
              if (errors)
                this.messages.error(errors, {
                  close: false,
                  onlyOne: true,
                  displayMode: 'replace',
                  target: messageContainerPassword
                });
              else if (data?.checkPasswordUser) resolve(true);
              else {
                this.messages.error("Password don't match.", {
                  close: false,
                  onlyOne: true,
                  displayMode: 'replace',
                  target: messageContainerPassword
                });
                resolve(false);
              }
            }
          })
          .add(() => {
            this.checkPasswordLoading = false;
          });
      } else {
        resolve(false);
      }
    });
  }

  confirmMessageType(): string {
    if (this.confirmTemplate) return 'template';
    else return 'text';
  }
}
