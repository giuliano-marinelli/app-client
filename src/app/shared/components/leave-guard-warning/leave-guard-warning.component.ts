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
  _dialog: MatDialog = inject(MatDialog);

  subject?: Subject<boolean>;

  proceed(value: boolean) {
    this._dialog.closeAll();
    if (this.subject) {
      this.subject.next(value);
      this.subject.complete();
    }
  }
}
