import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ApolloError } from '@apollo/client';

declare var iziToast: any;

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  constructor() {
    iziToast.settings({
      position: 'topCenter',
      maxWidth: '500px',
      timeout: 5000,
      class: 'iziToast-config'
    });
  }

  show(message: string, options?: any): void {
    this.send(message, 'show', options);
  }

  success(message: string, options?: any): void {
    this.send(message, 'success', options);
  }

  error(message: string | any, options: any = {}): void {
    if (Array.isArray(message)) {
      message = message
        .map((msj: any) => {
          return msj.message;
        })
        .join('<hr>');
    }
    options.timeout = 0;
    this.send(message, 'error', options);
  }

  warning(message: string, options?: any): void {
    this.send(message, 'warning', options);
  }

  info(message: string, options?: any): void {
    this.send(message, 'info', options);
  }

  private send(message: any, type: any, options?: any): void {
    if (options?.target && options.target.nativeElement && !options.target.nativeElement.id)
      options.target.nativeElement.id = 'message-container';
    if (options?.icon) options.icon = 'iziToast-icon-config ' + options.icon;
    let container =
      options?.target && options.target.nativeElement ? options.target.nativeElement.id : options?.target?.id;

    if (options?.onlyOne) this.clear(container);
    let toastOptions = {
      message: message,
      ...options,
      drag: options?.close != null ? options.close : true,
      class: (container || options?.container || '') + 'message-element iziToast-config',
      target: options?.target ? '#' + container : ''
    };

    switch (type) {
      case 'success':
        iziToast.success(toastOptions);
        break;
      case 'error':
        iziToast.error(toastOptions);
        break;
      case 'warning':
        iziToast.warning(toastOptions);
        break;
      case 'info':
        iziToast.info(toastOptions);
        break;
      default:
        iziToast.show(toastOptions);
        break;
    }
  }

  clear(container: string): void {
    document.querySelectorAll('.' + (container || '') + 'message-element').forEach((toast) => {
      iziToast.hide({}, toast);
    });
  }
}
