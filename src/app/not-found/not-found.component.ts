import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'not-found',
  templateUrl: './not-found.component.html',
  imports: [
    MatCardModule,
    MatIconModule
  ]
})
export class NotFoundComponent {}
