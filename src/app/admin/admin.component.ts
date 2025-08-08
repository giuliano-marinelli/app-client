import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../services/auth.service';

import { VarDirective } from '../shared/directives/var.directive';

@Component({
  selector: 'admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  imports: [VarDirective, RouterLink, RouterLinkActive, RouterOutlet]
})
export class AdminComponent implements OnInit {
  constructor(
    public auth: AuthService,
    public router: Router
  ) {}

  ngOnInit(): void {}
}
