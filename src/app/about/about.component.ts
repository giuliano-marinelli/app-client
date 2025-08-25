import { Component } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

import { TranslocoModule } from '@jsverse/transloco';

import { environment } from '../../environments/environment';

@Component({
  selector: 'about',
  templateUrl: './about.component.html',
  imports: [
    MatDividerModule,
    MatIconModule,
    TranslocoModule
  ]
})
export class AboutComponent {
  graphqlUrl = `${environment.protocol}${environment.host}:${environment.appPort}/${environment.graphql}`;
}
