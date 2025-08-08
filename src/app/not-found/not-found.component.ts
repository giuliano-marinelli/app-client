import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss'],
  imports: [MatCardModule, MatIconModule]
})
export class NotFoundComponent {
  $isSmallScreen: boolean = false;

  constructor(private _breakpointObserver: BreakpointObserver) {
    this._breakpointObserver.observe([Breakpoints.XSmall]).subscribe((result) => {
      this.$isSmallScreen = result.matches;
    });
  }
}
