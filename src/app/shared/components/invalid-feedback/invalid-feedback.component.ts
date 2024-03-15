import { Component, HostBinding, Input } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';

@Component({
  selector: 'invalid-feedback',
  templateUrl: './invalid-feedback.component.html',
  styleUrls: ['./invalid-feedback.component.scss']
})
export class InvalidFeedbackComponent {
  @Input() control?: FormControl | AbstractControl | null;
  @Input() name: string = 'This field';
  @Input() messages?: any;
  @HostBinding('class')
  elementClass = 'invalid-feedback';

  getErrorMessage(error: string): string {
    if (this.messages && this.messages[error]) {
      return this.messages[error];
    }
    switch (error) {
      case 'required':
        return `${this.name} is required.`;
      case 'minlength':
        return `${this.name} must be at least ${this.control?.errors?.['minlength']?.requiredLength} characters long.`;
      case 'maxlength':
        return `${this.name} must be at most ${this.control?.errors?.['maxlength']?.requiredLength} characters long.`;
      case 'url':
        return `${this.name} must be on the format http://www.example.com/something`;
      case 'email':
        return `${this.name} must be on the format example@email.com`;
      case 'usernameExists':
        return 'Username is already taken, please try another one';
      case 'emailExists':
        return 'Email is already taken, please try another one';
      case 'equalTo':
        return `${this.name} must match ${this.control?.errors?.['equalTo']?.controlName}.`;
      case 'pattern':
        return `${this.name} has invalid characters.`;
      default:
        return `${this.name} is invalid.`;
    }
  }
}
