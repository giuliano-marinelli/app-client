import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { Subject } from 'rxjs';

@Component({
  selector: 'leave-guard-warning',
  templateUrl: './leave-guard-warning.component.html',
  styleUrls: ['./leave-guard-warning.component.scss'],
  imports: [MatButtonModule, MatDialogModule]
})
export class LeaveGuardWarningComponent {
  subject?: Subject<boolean>;

  constructor(public dialog: MatDialog) {}

  proceed(value: boolean) {
    this.dialog.closeAll();
    if (this.subject) {
      this.subject.next(value);
      this.subject.complete();
    }
  }
}
