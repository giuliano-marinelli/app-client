import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({ selector: '[var]' })
export class VarDirective {
  @Input()
  set var(context: unknown) {
    this.context.$implicit = this.context.var = context;

    if (!this.hasView) {
      this.vcRef.createEmbeddedView(this.templateRef, this.context);
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

  private hasView: boolean = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private vcRef: ViewContainerRef
  ) {}
}
