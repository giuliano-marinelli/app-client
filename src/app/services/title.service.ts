import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { Observable, ReplaySubject, filter, map } from 'rxjs';

export interface Breadcrumb {
  path: string;
  title: string;
}

@Injectable({
  providedIn: 'root'
})
export class TitleService {
  router: Router = inject(Router);
  titleService: Title = inject(Title);

  appTitle = 'App';
  appSeparator = ' · ';
  subTitleSeparator = ' / ';

  titles: any[] = [];

  params: Record<string, string> = {};

  breadcrumb: Breadcrumb[] = [];
  breadcrumbSubject: ReplaySubject<Breadcrumb[]>;

  constructor() {
    this.breadcrumbSubject = new ReplaySubject();
  }

  initTitle(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => {
          let route: ActivatedRoute = this.router.routerState.root;
          const titles: any[] = [];
          const breadcrumb: Breadcrumb[] = [];

          // add the titles of the route tree nodes
          while (route?.firstChild) {
            route = route.firstChild;

            // add the title of the route
            if (route.snapshot.data['title']) titles.push(route.snapshot.data['title']);

            // add the breadcrumb of the route
            if (route.snapshot.data['breadcrumb'])
              breadcrumb.push({
                path: '/' + route.snapshot.url.map((r) => r.path).join('/'),
                title: route.snapshot.data['breadcrumb']
              });
          }

          return { titles, breadcrumb };
        })
      )
      .subscribe(({ titles, breadcrumb }) => {
        this.titles = titles;
        this.breadcrumb = breadcrumb;
        this.updateTitle();
        this.updateBreadcrumb();
      });
  }

  setParam(key: string, value: string): void {
    this.params[key] = value;
    this.updateTitle();
    this.updateBreadcrumb();
  }

  getBreadcrumb(): Observable<Breadcrumb[]> {
    return this.breadcrumbSubject.asObservable();
  }

  updateTitle(): void {
    let title = '';

    // process the title if it is a function call it with params else use it as is
    this.titles.forEach((t: any, i: number) => {
      title += typeof t === 'function' ? t(this.params) : t;

      // add the separator if it is not the last title
      if (i < this.titles.length - 1) title += this.subTitleSeparator;
    });

    // set the final title
    this.titleService.setTitle(title + this.appSeparator + this.appTitle);
  }

  updateBreadcrumb(): void {
    const breadcrumb: { path: string; title: string }[] = [];

    // process the breadcrumb if it is a function call it with params else use it as is
    this.breadcrumb.forEach((b: any) => {
      // check if the breadcrumb is a function
      const breadcrumbResult = typeof b.title === 'function' ? b.title(this.params) : b.title;

      // if result is a string then add it to the breadcrumb with the path
      if (typeof breadcrumbResult === 'string') {
        breadcrumb.push({ path: b.path, title: breadcrumbResult });
      } else if (Array.isArray(breadcrumbResult)) {
        // if result is an array then add each item to the breadcrumb with their custom path
        breadcrumbResult.forEach((item) => {
          breadcrumb.push({ path: item.path ?? b.path, title: item.title });
        });
      }
    });

    this.breadcrumbSubject.next(breadcrumb);
  }
}
