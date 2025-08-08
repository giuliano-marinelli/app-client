import { Component, Input, TemplateRef, ViewChild } from '@angular/core';

@Component({
  selector: 'menu-page',
  template: '<ng-template><ng-content></ng-content></ng-template>'
})
export class MatMenuPage {
  @Input() pageId: string | null = null;
  @Input() title = '';
  @ViewChild(TemplateRef) content!: TemplateRef<any>;
}
