import { CommonModule } from '@angular/common';
import { AfterContentInit, ChangeDetectorRef, Component, ContentChildren, QueryList } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { MatMenuPage } from './menu-page';

@Component({
  selector: 'mat-multi-page-menu',
  exportAs: 'matMultiPageMenu',
  templateUrl: './multi-page-menu.html',
  imports: [CommonModule, MatMenuModule, MatButtonModule, MatIconModule, MatDividerModule]
})
export class MatMultiPageMenu implements AfterContentInit {
  @ContentChildren(MatMenuPage) pages!: QueryList<MatMenuPage>;

  pageMap = new Map<string | null, MatMenuPage>();
  pageStack: MatMenuPage[] = [];

  constructor(private cdr: ChangeDetectorRef) {}

  get currentPage(): MatMenuPage | undefined {
    return this.pageStack[this.pageStack.length - 1];
  }

  get hasBackButton(): boolean {
    return this.pageStack.length > 1;
  }

  ngAfterContentInit(): void {
    for (const page of this.pages.toArray()) {
      this.pageMap.set(page.pageId || null, page);
    }

    const root = this.pageMap.get(null);
    if (root) {
      setTimeout(() => {
        this.pageStack = [root];
      });
    }

    this.cdr.markForCheck();
  }

  openSubPage(id: string) {
    const page = this.pageMap.get(id);
    if (page) {
      this.pageStack.push(page);
      this.cdr.markForCheck();
    }
  }

  goBack(event: MouseEvent) {
    event.stopPropagation();
    if (this.hasBackButton) {
      this.pageStack.pop();
      this.cdr.markForCheck();
    }
  }

  resetPages() {
    const root = this.pageMap.get(null);
    if (root) {
      this.pageStack = [root];
      this.cdr.markForCheck();
    }
  }
}
