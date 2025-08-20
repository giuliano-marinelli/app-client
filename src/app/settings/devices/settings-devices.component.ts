import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';

import { FindSessions, Session } from '../../shared/entities/session.entity';
import { Global } from '../../shared/global/global';

import { SessionCardComponent } from '../../shared/components/session/card/session-card.component';

import { AuthService } from '../../services/auth.service';
import { MessagesService } from '../../services/messages.service';

import { FilterPipe } from '../../shared/pipes/filter.pipe';

@Component({
  selector: 'settings-devices',
  templateUrl: './settings-devices.component.html',
  styleUrls: ['./settings-devices.component.scss'],
  imports: [
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule,
    FilterPipe,
    SessionCardComponent
  ]
})
export class SettingsDevicesComponent implements OnInit {
  auth: AuthService = inject(AuthService);
  router: Router = inject(Router);
  messages: MessagesService = inject(MessagesService);
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
        where: { user: { id: { eq: this.auth.user?.id } } },
        order: [{ blockedAt: 'ASC' }, { closedAt: 'ASC' }, { updatedAt: 'DESC' }]
      })
      .subscribe({
        next: ({ data, errors }: any) => {
          if (errors) {
            this.messages.error(errors, 'Could not fetch sessions. Please try again later.');
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
