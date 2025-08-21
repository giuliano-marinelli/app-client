import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

import { User } from '../../../entities/user.entity';

@Component({
  selector: 'user-mini',
  templateUrl: './user-mini.component.html',
  styleUrl: './user-mini.component.scss',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule
  ]
})
export class UserMiniComponent {
  @Input() user!: User;
}
