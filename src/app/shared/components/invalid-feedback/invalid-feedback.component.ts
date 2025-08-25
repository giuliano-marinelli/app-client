import { KeyValuePipe } from '@angular/common';
import { Component, HostBinding, Input } from '@angular/core';
import { AbstractControl, FormArray, FormControl } from '@angular/forms';

import { translate } from '@jsverse/transloco';

@Component({
  selector: 'invalid-feedback',
  templateUrl: './invalid-feedback.component.html',
  imports: [KeyValuePipe]
})
export class InvalidFeedbackComponent {
  @Input() control?: AbstractControl | null;
  @Input() name = 'This field';
  @Input() itemsName = 'items';
  @Input() messages?: any;
  @HostBinding('class')
  elementClass = 'invalid-feedback';

  getErrorMessage(error: string, index?: number): string {
    if (this.messages && this.messages[error]) {
      return this.messages[error];
    }

    let control = this.control as FormControl | FormArray;
    if (index !== undefined) control = (this.control as FormArray).at(index) as FormControl;

    switch (error) {
      case 'required':
        return translate('shared.invalidFeedback.required', { name: this.name });
      case 'minlength':
        if (index === undefined && this.isFormArray())
          return translate('shared.invalidFeedback.minlengthItem', {
            requiredLength: control?.errors?.['minlength']?.requiredLength,
            itemsName: this.itemsName
          });
        else
          return translate('shared.invalidFeedback.minlength', {
            name: this.name,
            requiredLength: control?.errors?.['minlength']?.requiredLength
          });
      case 'maxlength':
        if (index === undefined && this.isFormArray())
          return translate('shared.invalidFeedback.maxlengthItem', {
            requiredLength: control?.errors?.['maxlength']?.requiredLength,
            itemsName: this.itemsName
          });
        else
          return translate('shared.invalidFeedback.maxlength', {
            name: this.name,
            requiredLength: control?.errors?.['maxlength']?.requiredLength
          });
      case 'url':
        return translate('shared.invalidFeedback.url', { name: this.name });
      case 'email':
        return translate('shared.invalidFeedback.email', { name: this.name });
      case 'usernameExists':
        return translate('shared.invalidFeedback.usernameExists');
      case 'emailExists':
        return translate('shared.invalidFeedback.emailExists');
      case 'equalTo':
        return translate('shared.invalidFeedback.equalTo', {
          name: this.name,
          controlName: control?.errors?.['equalTo']?.controlName
        });
      case 'pattern':
        return translate('shared.invalidFeedback.pattern', { name: this.name });
      default:
        return translate('shared.invalidFeedback.invalid', { name: this.name });
    }
  }

  isFormArray(): boolean {
    return this.control instanceof FormArray;
  }

  getArrayChildErrors(): { error: string; index: number }[] {
    if (!this.isFormArray()) return [];
    const formArray = this.control as FormArray;
    const errorMap = new Map<string, number>();
    formArray.controls.forEach((ctrl, idx) => {
      if (ctrl.errors) {
        Object.keys(ctrl.errors).forEach((key) => {
          // only add the first occurrence of each error type
          if (!errorMap.has(key)) {
            errorMap.set(key, idx);
          }
        });
      }
    });

    return Array.from(errorMap.entries()).map(
      ([
        error,
        index
      ]) => ({ error, index })
    );
  }
}
