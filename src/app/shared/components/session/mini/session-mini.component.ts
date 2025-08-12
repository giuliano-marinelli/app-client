import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { CloseSession, Session } from '../../../entities/session.entity';
import { MomentModule } from 'ngx-moment';

import { ConfirmComponent } from '../../confirm/confirm.component';

import { AuthService } from '../../../../services/auth.service';
import { MessagesService } from '../../../../services/messages.service';

@Component({
  selector: 'session-mini',
  templateUrl: './session-mini.component.html',
  styleUrl: './session-mini.component.scss',
  imports: [ConfirmComponent, MatButtonModule, MatIconModule, MatMenuModule, MomentModule]
})
export class SessionMiniComponent {
  @Input() session!: Session;
  @Input() loading: boolean = false;

  @Output() loadingChange = new EventEmitter<boolean>();

  @Output() onClose: EventEmitter<Session> = new EventEmitter<Session>();

  constructor(
    public auth: AuthService,
    public messages: MessagesService,
    public _closeSession: CloseSession
  ) {}

  closeSession(session: Session): void {
    if (!session) return;

    this.loading = true;
    this.loadingChange.emit(this.loading);

    this._closeSession
      .mutate({ id: session.id })
      .subscribe({
        next: ({ data, errors }) => {
          if (errors) this.messages.error(errors, 'Could not close session. Please try again later.');
          if (data?.closeSession) {
            this.messages.info('Session successfully closed.');
            this.onClose.emit(data?.closeSession);
          }
        }
      })
      .add(() => {
        this.loading = false;
        this.loadingChange.emit(this.loading);
      });
  }

  deviceTypeIcon(deviceType: string = ''): string {
    if (!deviceType || deviceType == '') return 'help';
    else if (deviceType.includes('desktop')) return 'desktop_windows';
    else if (deviceType.includes('laptop')) return 'laptop';
    else if (deviceType.includes('tablet')) return 'tablet_android';
    else if (deviceType.includes('smartphone') || deviceType.includes('mobile')) return 'smartphone';
    else if (deviceType.includes('smarttv') || deviceType.includes('tv')) return 'tv';
    else return 'help';
  }

  browserIcon(client: string = ''): string {
    if (client.includes('Chrome')) return 'chrome';
    else if (client.includes('Firefox')) return 'firefox';
    else if (client.includes('Safari')) return 'safari';
    else if (client.includes('Opera')) return 'opera';
    else return 'unknown';
  }
}
