import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { environment } from '../environments/environment';
import { filter, map } from 'rxjs';

import { Logout } from './shared/entities/user.entity';

import { AuthService } from './services/auth.service';
import { DarkmodeService } from './services/darkmode.service';
import { MessagesService } from './services/messages.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'app-client';
  currentYear = new Date().getUTCFullYear();
  fullNavbar = false;
  isDevelopment: boolean = !environment.production;

  constructor(
    public auth: AuthService,
    public router: Router,
    public messages: MessagesService,
    public titleService: Title,
    public darkmodeService: DarkmodeService,
    public _logout: Logout
  ) {}

  ngOnInit() {
    //initialize darkmode
    this.darkmodeService.initTheme();

    //for change page title
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => {
          let route: ActivatedRoute = this.router.routerState.root;
          let routeTitle = '';
          while (route!.firstChild) {
            route = route.firstChild;
          }
          if (route.snapshot.data['title'] != undefined) {
            routeTitle = route!.snapshot.data['title'];
          }
          return routeTitle;
        })
      )
      .subscribe((title: string) => {
        if (title) {
          this.titleService.setTitle(`${title} · App`);

          //for make navbar take full size when using Editor
          this.fullNavbar = title == 'Editor';
        } else {
          this.titleService.setTitle(`App`);
        }
      });
  }

  logout() {
    this._logout.fetch().subscribe({
      next: ({ data, errors }) => {
        if (errors) this.messages.error(errors);
        else if (data?.logout) {
          this.auth.eraseToken();
          this.auth.setUser();
          this.messages.success('Goodbye! Hope to see you soon!');
        }
      }
    });
  }
}
