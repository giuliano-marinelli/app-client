import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import { CanDeactivateFn } from '@angular/router';

import { Subject } from 'rxjs';

import { LeaveGuardWarningComponent } from '../components/leave-guard-warning/leave-guard-warning.component';

export const LeaveGuard: CanDeactivateFn<Component> = (component: Component) => {
  const dialog = inject(MatDialog);
  if ((component as any)['hasChanges'] == null || (component as any)['hasChanges']()) {
    const subject = new Subject<boolean>();

    const dialogRef = dialog.open(LeaveGuardWarningComponent);
    dialogRef.componentInstance.subject = subject;

    return subject.asObservable();
    // return window.confirm('Do you want to leave the website?\nChanges may not be saved.');
  }
  return true;
};
