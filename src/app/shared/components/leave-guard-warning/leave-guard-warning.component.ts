import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { Subject } from 'rxjs';

@Component({
  selector: 'leave-guard-warning',
  templateUrl: './leave-guard-warning.component.html',
  imports: [
    MatButtonModule,
    MatDialogModule
  ]
})
export class LeaveGuardWarningComponent {
  dialog: MatDialog = inject(MatDialog);

  subject?: Subject<boolean>;

  proceed(value: boolean) {
    this.dialog.closeAll();
    if (this.subject) {
      this.subject.next(value);
      this.subject.complete();
    }
  }
}
