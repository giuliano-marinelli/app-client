import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { NgbCollapse } from '@ng-bootstrap/ng-bootstrap';

import { AuthService } from '../services/auth.service';

import { VarDirective } from '../shared/directives/var.directive';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
  imports: [VarDirective, FaIconComponent, RouterLink, NgbCollapse, RouterLinkActive, RouterOutlet]
})
export class AccountComponent implements OnInit {
  constructor(
    public auth: AuthService,
    public router: Router
  ) {}

  ngOnInit(): void {}
}
