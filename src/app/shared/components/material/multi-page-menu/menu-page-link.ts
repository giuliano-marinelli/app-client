import { Directive, ElementRef, Input, OnInit, Renderer2, inject } from '@angular/core';

import { MatMultiPageMenu } from './multi-page-menu';

@Directive({
  selector: '[matMenuPageLink]'
})
export class MatMenuPageLink implements OnInit {
  menu = inject(MatMultiPageMenu);
  el = inject(ElementRef<HTMLElement>);
  renderer = inject(Renderer2);

  @Input('matMenuPageLink') targetPageId!: string;

  ngOnInit(): void {
    this.renderer.listen(this.el.nativeElement, 'click', (event) => {
      // Prevent the click event from propagating to parent elements
      event.stopPropagation();
      this.menu.openSubPage(this.targetPageId);
    });
  }
}
