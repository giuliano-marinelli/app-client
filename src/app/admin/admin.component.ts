import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { VarDirective } from '../shared/directives/var.directive';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { NgbCollapse } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss'],
    imports: [VarDirective, FaIconComponent, NgbCollapse, RouterLink, RouterLinkActive, RouterOutlet]
})
export class AdminComponent implements OnInit {

  constructor(
    public auth: AuthService,
    public router: Router
  ) { }

  ngOnInit(): void {
  }

}
