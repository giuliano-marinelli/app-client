import { Directive, Input, TemplateRef, ViewContainerRef, inject } from '@angular/core';

@Directive({ selector: '[var]' })
export class VarDirective {
  templateRef: TemplateRef<any> = inject(TemplateRef);
  vcRef: ViewContainerRef = inject(ViewContainerRef);

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

  private hasView = false;
}
