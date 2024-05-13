import { Component, Input } from '@angular/core';

@Component({
  selector: 'verified-mark',
  templateUrl: './verified-mark.component.html',
  styleUrl: './verified-mark.component.scss'
})
export class VerifiedMarkComponent {
  @Input() verified?: boolean = true;
  @Input() color?: string = 'primary';
  @Input() markNotVerified?: boolean = false;
}
