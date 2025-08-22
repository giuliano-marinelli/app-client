import { Component, inject } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

import { environment } from '../../environments/environment';

import { AuthService } from '../services/auth.service';
import { MessagesService } from '../services/messages.service';

@Component({
  selector: 'about',
  templateUrl: './about.component.html',
  imports: [
    MatDividerModule,
    MatIconModule
  ]
})
export class AboutComponent {
  messages: MessagesService = inject(MessagesService);
  auth: AuthService = inject(AuthService);

  graphqlUrl = `${environment.protocol}${environment.host}:${environment.appPort}/${environment.graphql}`;
}
