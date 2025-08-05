import { Component } from '@angular/core';

import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Subject } from 'rxjs';

@Component({
  selector: 'leave-guard-warning',
  templateUrl: './leave-guard-warning.component.html',
  styleUrls: ['./leave-guard-warning.component.scss']
})
export class LeaveGuardWarningComponent {
  subject?: Subject<boolean>;

  constructor(
    public activeModal: NgbActiveModal,
    private modalService: NgbModal
  ) {}

  proceed(value: boolean) {
    this.modalService.dismissAll();
    if (this.subject) {
      this.subject.next(value);
      this.subject.complete();
    }
  }
}
