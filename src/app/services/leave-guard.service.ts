import { Component, Injectable, inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Subject } from 'rxjs';

import { LeaveGuardWarningComponent } from '../shared/components/leave-guard-warning/leave-guard-warning.component';

export const LeaveGuard: CanDeactivateFn<Component> = (component: Component) => {
  if ((component as any)['hasChanges'] == null || (component as any)['hasChanges']()) {
    const subject = new Subject<boolean>();

    const modal = inject(NgbModal).open(LeaveGuardWarningComponent);
    modal.componentInstance.subject = subject;

    return subject.asObservable();
    // return window.confirm('Do you want to leave the website?\nChanges may not be saved.');
  }
  return true;
};
