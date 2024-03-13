import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';

import { CheckEmailAddressExists } from '../entities/email.entity';
import { CheckUserUsernameExists } from '../entities/user.entity';
import { isEmail } from 'class-validator';
import { map } from 'rxjs';

export class ExtraValidators {
  /**
   * @description
   * Validator that requires the control's username value to not exist in the database.
   * @returns An error map with the `username` property
   * if the validation check fails, otherwise `null`.
   */
  static usernameExists(checkUsernameExists: CheckUserUsernameExists): AsyncValidatorFn {
    return (control: AbstractControl) => {
      return checkUsernameExists.fetch({ username: control.value }).pipe(
        map(({ data }) => {
          return data?.checkUserUsernameExists ? { usernameExists: true } : null;
        })
      );
    };
  }

  /**
   * @description
   * Validator that requires the control's email value to not exist in the database.
   * @returns An error map with the `email` property
   * if the validation check fails, otherwise `null`.
   */
  static emailExists(checkAddressExists: CheckEmailAddressExists, verified?: boolean): AsyncValidatorFn {
    return (control: AbstractControl) => {
      return checkAddressExists.fetch({ address: control.value }).pipe(
        map(({ data }) => {
          return data?.checkEmailAddressExists ? { emailExists: true } : null;
        })
      );
    };
  }

  /**
   * @description
   * Validator that requires the control's value pass an email validation given by `class-validator` package.
   * @returns An error map with the `email` property
   * if the validation check fails, otherwise `null`.
   */
  static email(control: AbstractControl): ValidationErrors | null {
    return control.value && isEmail(control.value) ? null : { email: true };
  }

  /**
   * Checks if the value of a form control is equal to a given value.
   *
   * @param val - The value to compare against.
   * @param compare - An optional function that compares the control value and the given value.
   *                  If provided, this function should return a boolean indicating whether the values are equal.
   */
  static equal = (val: any, compare?: (controlValue: any, value: any) => boolean): ValidatorFn => {
    return (control: AbstractControl): ValidationErrors | null => {
      const v: any = control.value;
      let areEquals;
      if (compare && typeof compare == 'function') areEquals = compare(val, v);
      else areEquals = val === v;

      return areEquals ? null : { equal: { value: val } };
    };
  };

  /**
   * Checks if the value of a form control is not equal to a given value.
   *
   * @param val - The value to compare against.
   * @param compare - An optional function to customize the comparison logic. It should return true if the values are equal, and false otherwise.
   */
  static notEqual = (val: any, compare?: (controlValue: any, value: any) => boolean): ValidatorFn => {
    return (control: AbstractControl): ValidationErrors | null => {
      const v: any = control.value;
      let areNotEquals;
      if (compare && typeof compare == 'function') areNotEquals = !compare(val, v);
      else areNotEquals = val !== v;

      return areNotEquals ? null : { notEqual: { value: val } };
    };
  };
}
