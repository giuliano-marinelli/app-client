import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { filter, map } from 'rxjs';

import { AuthService } from './services/auth.service';
import { DarkmodeService } from './services/darkmode.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'concept-client';
  currentYear = new Date().getUTCFullYear();
  fullNavbar = false;

  constructor(
    public auth: AuthService,
    public router: Router,
    public titleService: Title,
    public darkmodeService: DarkmodeService
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
}
