import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'verified-mark',
  templateUrl: './verified-mark.component.html',
  styleUrl: './verified-mark.component.scss',
  imports: [MatIconModule]
})
export class VerifiedMarkComponent {
  @Input() verified?: boolean = true;
  @Input() markNotVerified?: boolean = false;
}
