import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';

import { TranslocoModule, translate } from '@jsverse/transloco';

import { NgxMasonryComponent } from 'ngx-masonry';
import { MomentModule } from 'ngx-moment';
import { NgxResizeObserverModule } from 'ngx-resize-observer';

import { Session } from '../../../entities/session.entity';
import { DeleteUser, User } from '../../../entities/user.entity';

import { ConfirmComponent } from '../../confirm/confirm.component';
import { SessionMiniComponent } from '../../session/mini/session-mini.component';
import { VerifiedMarkComponent } from '../../verified-mark/verified-mark.component';
import { UserMiniComponent } from '../mini/user-mini.component';

import { AuthService } from '../../../../services/auth.service';
import { MessagesService } from '../../../../services/messages.service';

import { LongPressCopyDirective } from '../../../directives/long-press-copy.directive';

import { FilterPipe } from '../../../pipes/filter.pipe';

@Component({
  selector: 'user-card',
  templateUrl: './user-card.component.html',
  imports: [
    ConfirmComponent,
    FilterPipe,
    LongPressCopyDirective,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatExpansionModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MomentModule,
    NgxResizeObserverModule,
    RouterLink,
    SessionMiniComponent,
    TranslocoModule,
    UserMiniComponent,
    VerifiedMarkComponent
  ]
})
export class UserCardComponent {
  _auth: AuthService = inject(AuthService);
  _messages: MessagesService = inject(MessagesService);
  _deleteUser: DeleteUser = inject(DeleteUser);

  @Input() user!: User;
  @Input() masonry?: NgxMasonryComponent;
  @Input() loading = false;

  @Output() loadingChange = new EventEmitter<boolean>();
  @Output() deleted: EventEmitter<string> = new EventEmitter<string>();
  @Output() sessionClosed: EventEmitter<Session> = new EventEmitter<Session>();

  deleteUser({ password }: any): void {
    this.loading = true;
    this.loadingChange.emit(this.loading);

    this._deleteUser
      .mutate({ id: this.user.id, password: password })
      .subscribe({
        next: ({ data, errors }) => {
          if (errors) {
            this._messages.error(errors, translate('shared.user.messages.deleteUserError'));
          }
          if (data?.deleteUser) {
            this._messages.info(translate('shared.user.messages.deleteUserSuccess'));
            this.deleted.emit(data?.deleteUser);
          }
        }
      })
      .add(() => {
        this.loading = false;
        this.loadingChange.emit(this.loading);
      });
  }
}
