import { Component, OnInit } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

import { environment } from '../../environments/environment';

import { AuthService } from '../services/auth.service';
import { MessagesService } from '../services/messages.service';

@Component({
  selector: 'about',
  templateUrl: './about.component.html',
  imports: [MatDividerModule, MatIconModule],
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  JSON = JSON;

  graphqlUrl: string = `http://${environment.host}:${environment.appPort}/${environment.graphql}`;

  constructor(
    public messages: MessagesService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {}
}
