import { KeyValuePipe } from '@angular/common';
import { Component, HostBinding, Input } from '@angular/core';
import { AbstractControl, FormArray, FormControl } from '@angular/forms';

@Component({
  selector: 'invalid-feedback',
  templateUrl: './invalid-feedback.component.html',
  styleUrls: ['./invalid-feedback.component.scss'],
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
        return `${this.name} is required.`;
      case 'minlength':
        if (index === undefined && this.isFormArray())
          return `Must have at least ${control?.errors?.['minlength']?.requiredLength} ${this.itemsName}.`;
        else return `${this.name} must be at least ${control?.errors?.['minlength']?.requiredLength} characters long.`;
      case 'maxlength':
        if (index === undefined && this.isFormArray())
          return `Must have at most ${control?.errors?.['maxlength']?.requiredLength} ${this.itemsName}.`;
        else return `${this.name} must be at most ${control?.errors?.['maxlength']?.requiredLength} characters long.`;
      case 'url':
        return `${this.name} must be on the format http://www.example.com/something`;
      case 'email':
        return `${this.name} must be on the format example@email.com`;
      case 'usernameExists':
        return 'Username is already taken, please try another one';
      case 'emailExists':
        return 'Email is already taken, please try another one';
      case 'tagExists':
        return 'Tag is already taken, please try another one';
      case 'equalTo':
        return `${this.name} must match ${control?.errors?.['equalTo']?.controlName}.`;
      case 'pattern':
        return `${this.name} has invalid characters.`;
      default:
        return `${this.name} is invalid.`;
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

    return Array.from(errorMap.entries()).map(([error, index]) => ({ error, index }));
  }
}
