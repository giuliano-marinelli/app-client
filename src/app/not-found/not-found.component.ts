import { Component, OnInit } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
    selector: 'app-not-found',
    templateUrl: './not-found.component.html',
    styleUrls: ['./not-found.component.scss'],
    imports: [FaIconComponent]
})
export class NotFoundComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    document.body.classList.add('not-found-background');
  }

  ngOnDestroy(): void {
    document.body.classList.remove('not-found-background');
  }
}
