import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { IconName, IconProp } from '@fortawesome/fontawesome-svg-core';

import { CloseSession, FindSessions, Session } from '../../shared/entities/session.entity';
import { Global } from '../../shared/global/global';

import { AuthService } from '../../services/auth.service';
import { MessagesService } from '../../services/messages.service';

@Component({
  selector: 'app-devices-settings',
  templateUrl: './devices-settings.component.html',
  styleUrls: ['./devices-settings.component.scss']
})
export class DevicesSettingsComponent implements OnInit {
  @ViewChild('message_container') messageContainer!: ElementRef;
  filter: any = Global.filter;

  sessionsLoading: boolean = true;
  submitLoading: string[] = [];

  sessions: Session[] = [];
  sessionsPage: number = 1;
  sessionsPageSize: number = 10;
  sessionsCount: number = 0;

  constructor(
    public auth: AuthService,
    public router: Router,
    public messages: MessagesService,
    private _findSessions: FindSessions,
    private _closeSession: CloseSession
  ) {}

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
          if (errors)
            this.messages.error(errors, {
              onlyOne: true,
              displayMode: 'replace',
              target: this.messageContainer
            });
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

  closeSession(session: Session): void {
    if (session.id) this.submitLoading.push(session.id);
    this._closeSession
      .mutate({ id: session.id })
      .subscribe({
        next: ({ data, errors }) => {
          if (errors)
            this.messages.error(errors, {
              close: false,
              onlyOne: true,
              displayMode: 'replace',
              target: this.messageContainer
            });
          if (data?.closeSession) {
            this.getSessions();
            this.messages.success('Session successfully closed.', {
              onlyOne: true,
              displayMode: 'replace'
              // target: this.messageContainer
            });
          }
        }
      })
      .add(() => {
        this.submitLoading = this.submitLoading.filter((id) => id != session.id);
      });
  }

  deviceTypeIcon(deviceType: string = ''): IconProp {
    if (!deviceType || deviceType == '') return ['far', 'circle-question'];
    else if (deviceType.includes('desktop')) return ['fas', 'desktop'];
    else if (deviceType.includes('laptop')) return ['fas', 'laptop'];
    else if (deviceType.includes('tablet')) return ['fas', 'tablet'];
    else if (deviceType.includes('smartphone') || deviceType.includes('mobile')) return ['fas', 'mobile'];
    else if (deviceType.includes('smarttv') || deviceType.includes('tv')) return ['fas', 'tv'];
    else return ['far', 'circle-question'];
  }

  browserIcon(client: string = ''): IconProp {
    if (client.includes('Chrome')) return ['fab', 'chrome'];
    else if (client.includes('Firefox')) return ['fab', 'firefox'];
    else if (client.includes('Safari')) return ['fab', 'safari'];
    else if (client.includes('Opera')) return ['fab', 'opera'];
    else if (client.includes('Edge')) return ['fab', 'edge'];
    else if (client.includes('Internet Explorer')) return ['fab', 'internet-explorer'];
    else return ['fas', 'circle-question'];
  }
}
