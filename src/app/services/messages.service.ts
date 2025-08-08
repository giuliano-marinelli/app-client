import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef } from '@angular/material/snack-bar';

declare var iziToast: any;

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  private _snackBar = inject(MatSnackBar);
  private _snackBarRef: MatSnackBarRef<any> | null = null;

  constructor() {}

  info(message: string, config?: MatSnackBarConfig): void {
    this._snackBarRef = this._snackBar.open(message, 'Close', config || { duration: 3000 });
  }

  error(message: string | any, altMessage?: string, config?: MatSnackBarConfig): void {
    if (Array.isArray(message)) {
      message = message
        .map((msj: any) => {
          return msj.message;
        })
        .join('<hr>');
    }

    this._snackBarRef = this._snackBar.open(message || altMessage, 'Close', config || { duration: 3000 });
  }

  clear(): void {
    this._snackBarRef?.dismiss();
  }
}
