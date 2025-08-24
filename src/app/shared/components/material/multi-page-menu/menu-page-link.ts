import { Directive, ElementRef, Input, OnInit, Renderer2, inject } from '@angular/core';

import { MatMultiPageMenu } from './multi-page-menu';

@Directive({
  selector: '[matMenuPageLink]'
})
export class MatMenuPageLink implements OnInit {
  _menu = inject(MatMultiPageMenu);
  _el = inject(ElementRef<HTMLElement>);
  _renderer = inject(Renderer2);

  @Input('matMenuPageLink') targetPageId!: string;

  ngOnInit(): void {
    this._renderer.listen(this._el.nativeElement, 'click', (event) => {
      // Prevent the click event from propagating to parent elements
      event.stopPropagation();
      this._menu.openSubPage(this.targetPageId);
    });
  }
}
