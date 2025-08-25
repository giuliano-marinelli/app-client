import { LowerCasePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { TranslocoModule, translate } from '@jsverse/transloco';

import { MomentModule } from 'ngx-moment';

import { CloseSession, Session } from '../../../entities/session.entity';

import { ConfirmComponent } from '../../confirm/confirm.component';

import { AuthService } from '../../../../services/auth.service';
import { MessagesService } from '../../../../services/messages.service';

@Component({
  selector: 'session-mini',
  templateUrl: './session-mini.component.html',
  imports: [
    ConfirmComponent,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MomentModule,
    LowerCasePipe,
    TranslocoModule
  ]
})
export class SessionMiniComponent {
  _auth: AuthService = inject(AuthService);
  _messages: MessagesService = inject(MessagesService);
  _closeSession: CloseSession = inject(CloseSession);

  @Input() session!: Session;
  @Input() loading = false;

  @Output() loadingChange = new EventEmitter<boolean>();

  @Output() closed: EventEmitter<Session> = new EventEmitter<Session>();

  closeSession(session: Session): void {
    if (!session) return;

    this.loading = true;
    this.loadingChange.emit(this.loading);

    this._closeSession
      .mutate({ id: session.id })
      .subscribe({
        next: ({ data, errors }) => {
          if (errors) this._messages.error(errors, translate('shared.session.messages.closeSessionError'));
          if (data?.closeSession) {
            this._messages.info(translate('shared.session.messages.closeSessionSuccess'));
            this.closed.emit(data?.closeSession);
          }
        }
      })
      .add(() => {
        this.loading = false;
        this.loadingChange.emit(this.loading);
      });
  }

  deviceTypeIcon(deviceType = ''): string {
    if (!deviceType || deviceType == '') return 'help';
    else if (deviceType.includes('desktop')) return 'desktop_windows';
    else if (deviceType.includes('laptop')) return 'laptop';
    else if (deviceType.includes('tablet')) return 'tablet_android';
    else if (deviceType.includes('smartphone') || deviceType.includes('mobile')) return 'smartphone';
    else if (deviceType.includes('smarttv') || deviceType.includes('tv')) return 'tv';
    else return 'help';
  }

  browserIcon(client = ''): string {
    if (client.includes('Chrome')) return 'chrome';
    else if (client.includes('Firefox')) return 'firefox';
    else if (client.includes('Safari')) return 'safari';
    else if (client.includes('Opera')) return 'opera';
    else return 'unknown';
  }
}
