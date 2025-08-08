import { Directive, ElementRef, Input, OnInit, Renderer2, inject } from '@angular/core';

import { MatMultiPageMenu } from './multi-page-menu';

@Directive({
  selector: '[matMenuPageLink]'
})
export class MatMenuPageLink implements OnInit {
  @Input('matMenuPageLink') targetPageId!: string;
  private menu = inject(MatMultiPageMenu);
  private el = inject(ElementRef<HTMLElement>);
  private renderer = inject(Renderer2);

  ngOnInit(): void {
    this.renderer.listen(this.el.nativeElement, 'click', (event) => {
      // Prevent the click event from propagating to parent elements
      event.stopPropagation();
      this.menu.openSubPage(this.targetPageId);
    });
  }
}
