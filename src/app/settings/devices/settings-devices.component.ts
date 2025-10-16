import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';

import { TranslocoModule, translate } from '@jsverse/transloco';

import { Global } from '../../shared/global/global';

import { FindSessions, Session } from '../../shared/entities/session.entity';

import { SessionCardComponent } from '../../shared/components/session/card/session-card.component';

import { AuthService } from '../../services/auth.service';
import { MessagesService } from '../../services/messages.service';

import { FilterPipe } from '../../shared/pipes/filter.pipe';

@Component({
  selector: 'settings-devices',
  templateUrl: './settings-devices.component.html',
  imports: [
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule,
    FilterPipe,
    SessionCardComponent,
    TranslocoModule
  ]
})
export class SettingsDevicesComponent implements OnInit {
  _auth: AuthService = inject(AuthService);
  _router: Router = inject(Router);
  _messages: MessagesService = inject(MessagesService);
  _findSessions: FindSessions = inject(FindSessions);

  filter: any = Global.filter;

  sessionsLoading = true;
  submitLoading: string[] = [];

  sessions?: Session[];
  sessionsCount = 0;

  ngOnInit(): void {
    this.getSessions();
  }

  getSessions(): void {
    this.sessionsLoading = true;
    this._findSessions
      .fetch({
        where: { user: { id: { eq: this._auth.user?.id } } },
        order: [
          { blockedAt: 'ASC' },
          { closedAt: 'ASC' },
          { updatedAt: 'DESC' }]
      })
      .subscribe({
        next: ({ data, error }: any) => {
          if (error) {
            this._messages.error(translate('messages.fetchSessionsError'));
          }
          if (data?.sessions) {
            const sessions = data?.sessions;
            this.sessions = sessions?.set;
            this.sessionsCount = sessions?.count;
          }
        }
      })
      .add(() => {
        this.sessionsLoading = false;
      });
  }
}
