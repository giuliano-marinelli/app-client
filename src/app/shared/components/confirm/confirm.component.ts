import { Component, EventEmitter, HostListener, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

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

  modal?: NgbModalRef;

  passwordForm!: UntypedFormGroup;
  password = new UntypedFormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(30)]);

  constructor(
    private modalService: NgbModal,
    public formBuilder: UntypedFormBuilder
  ) {}

  setValid(control: UntypedFormControl): object {
    return {
      'is-invalid': control.dirty && !control.valid,
      'is-valid': control.dirty && control.valid
    };
  }

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

  confirmAction(requirePassword?: boolean) {
    if (requirePassword) {
      this.modal?.close();
      this.openPassword();
    } else if (!this.requiredPassword || this.checkPassword()) {
      this.modal?.close();
      this.confirm?.emit();
    }
  }

  rejectAction() {
    this.modal?.close();
    this.reject?.emit();
  }

  checkPassword(): boolean {
    return false;
    //TODO
  }

  confirmMessageType(): string {
    if (this.confirmTemplate) return 'template';
    else return 'text';
  }
}
