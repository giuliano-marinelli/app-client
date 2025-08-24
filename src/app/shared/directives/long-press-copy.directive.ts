import { Directive, HostListener, Input, inject } from '@angular/core';

import { MessagesService } from '../../services/messages.service';

@Directive({
  selector: '[longPressCopy]'
})
export class LongPressCopyDirective {
  _messages: MessagesService = inject(MessagesService);

  @Input() longPressCopy?: string;

  private timeout: any;

  @HostListener('mousedown') onMouseDown() {
    this.timeout = setTimeout(() => {
      this.copyToClipboard(this.longPressCopy);
    }, 500);
  }

  @HostListener('mouseup') onMouseUp() {
    clearTimeout(this.timeout);
  }

  @HostListener('mouseleave') onMouseLeave() {
    clearTimeout(this.timeout);
  }

  @HostListener('touchstart') onTouchStart() {
    this.timeout = setTimeout(() => {
      this.copyToClipboard(this.longPressCopy);
    }, 500);
  }

  @HostListener('touchend') onTouchEnd() {
    clearTimeout(this.timeout);
  }

  private copyToClipboard(text?: string): void {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      this._messages.info(`Copied ${text} to clipboard!`);
    });
  }
}
