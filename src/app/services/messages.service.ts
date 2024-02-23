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
      timeout: 5000
    });
  }

  show(message: string, options?: any): void {
    this.send(message, 'show', options);
  }

  success(message: string, options?: any): void {
    this.send(message, 'success', options);
  }

  error(message: string | ApolloError | HttpErrorResponse, options: any = {}): void {
    if (typeof message == 'object') {
      const apolloError = message as ApolloError;
      if (apolloError.graphQLErrors?.length)
        message = apolloError.graphQLErrors
          .map((msj: any) => {
            return msj.message;
          })
          .join('<hr>');
      else if (apolloError.networkError) {
        const httpError = apolloError.networkError as HttpErrorResponse;
        console.log(httpError);

        message = httpError.error.errors
          .map((msj: any) => {
            return msj.message;
          })
          .join('<hr>');
      }
    } else {
      message = message;
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
    if (options?.target && !options.target.nativeElement.id) options.target.nativeElement.id = 'message-container';
    let container = options?.target ? options.target.nativeElement.id : null;

    if (options?.onlyOne) this.clear(container);
    let toastOptions = {
      message: message,
      ...options,
      drag: options?.close != null ? options.close : true,
      class: (container || '') + 'message-element',
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

  private clear(container: string): void {
    document.querySelectorAll('.' + (container || '') + 'message-element').forEach((toast) => {
      iziToast.hide({}, toast);
    });
  }
}
