import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';

import { Session } from '../../../entities/session.entity';
import { DeleteUser, User } from '../../../entities/user.entity';
import { NgxMasonryComponent } from 'ngx-masonry';
import { MomentModule } from 'ngx-moment';
import { NgxResizeObserverModule } from 'ngx-resize-observer';

import { ConfirmComponent } from '../../confirm/confirm.component';
import { SessionMiniComponent } from '../../session/mini/session-mini.component';
import { VerifiedMarkComponent } from '../../verified-mark/verified-mark.component';
import { UserMiniComponent } from '../mini/user-mini.component';

import { AuthService } from '../../../../services/auth.service';
import { MessagesService } from '../../../../services/messages.service';

import { FilterPipe } from '../../../pipes/filter.pipe';

@Component({
  selector: 'user-card',
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.scss',
  imports: [
    ConfirmComponent,
    FilterPipe,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatExpansionModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MomentModule,
    MatDividerModule,
    NgxResizeObserverModule,
    RouterLink,
    SessionMiniComponent,
    UserMiniComponent,
    VerifiedMarkComponent
  ]
})
export class UserCardComponent {
  @Input() user!: User;
  @Input() masonry?: NgxMasonryComponent;
  @Input() loading: boolean = false;

  @Output() loadingChange = new EventEmitter<boolean>();
  @Output() onDelete: EventEmitter<string> = new EventEmitter<string>();
  @Output() onSessionClose: EventEmitter<Session> = new EventEmitter<Session>();

  constructor(
    public auth: AuthService,
    public messages: MessagesService,
    private _deleteUser: DeleteUser
  ) {}

  deleteUser({ password, verificationCode }: any, user: User): void {
    if (!user) return;

    this.loading = true;
    this.loadingChange.emit(this.loading);

    this._deleteUser
      .mutate({ id: user.id, password: password })
      .subscribe({
        next: ({ data, errors }) => {
          if (errors) {
            this.messages.error(errors, 'Could not delete user. Please try again later.');
          }
          if (data?.deleteUser) {
            this.messages.info('User successfully deleted.');
            this.onDelete.emit(data?.deleteUser);
          }
        }
      })
      .add(() => {
        this.loading = false;
        this.loadingChange.emit(this.loading);
      });
  }
}
