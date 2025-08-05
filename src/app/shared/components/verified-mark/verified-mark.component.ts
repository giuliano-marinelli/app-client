import { Component, Input } from '@angular/core';
import { FaLayersComponent, FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
    selector: 'verified-mark',
    templateUrl: './verified-mark.component.html',
    styleUrl: './verified-mark.component.scss',
    imports: [FaLayersComponent, FaIconComponent]
})
export class VerifiedMarkComponent {
  @Input() verified?: boolean = true;
  @Input() color?: string = 'primary';
  @Input() markNotVerified?: boolean = false;
}
