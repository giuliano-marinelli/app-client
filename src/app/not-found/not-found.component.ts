import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'not-found',
  templateUrl: './not-found.component.html',
  imports: [
    MatCardModule,
    MatIconModule,
    TranslocoModule
  ]
})
export class NotFoundComponent {}
