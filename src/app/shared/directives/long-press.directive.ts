import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[longPress]'
})
export class LongPressDirective {
  @Output() longPress = new EventEmitter<void>();
  private timeout: any;

  @HostListener('mousedown') onMouseDown() {
    this.timeout = setTimeout(() => {
      this.longPress.emit();
    }, 500); // Trigger after 500ms
  }

  @HostListener('mouseup') onMouseUp() {
    clearTimeout(this.timeout);
  }

  @HostListener('mouseleave') onMouseLeave() {
    clearTimeout(this.timeout);
  }

  @HostListener('touchstart') onTouchStart() {
    this.timeout = setTimeout(() => {
      this.longPress.emit();
    }, 500); // Trigger after 500ms
  }

  @HostListener('touchend') onTouchEnd() {
    clearTimeout(this.timeout);
  }
}
