import { Directive, Input, TemplateRef, ViewContainerRef, inject } from '@angular/core';

@Directive({ selector: '[var]' })
export class VarDirective {
  _templateRef: TemplateRef<any> = inject(TemplateRef);
  _vcRef: ViewContainerRef = inject(ViewContainerRef);

  @Input()
  set var(context: unknown) {
    this.context.$implicit = this.context.var = context;

    if (!this.hasView) {
      this._vcRef.createEmbeddedView(this._templateRef, this.context);
      this.hasView = true;
    }
  }

  private context: {
    $implicit: unknown;
    var: unknown;
  } = {
    $implicit: null,
    var: null
  };

  private hasView = false;
}
