import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';

import { User } from '../entities/user.entity';
import { FindUsers } from '../entities/user.entity';
import { isEmail } from 'class-validator';
import { map } from 'rxjs';

export class ExtraValidators {
  /**
   * @description
   * Validator that requires the control's username value to not exist in the database.
   * @returns An error map with the `username` property
   * if the validation check fails, otherwise `null`.
   */
  static usernameExists(findUsers: FindUsers, differentTo?: User): AsyncValidatorFn {
    return (control: AbstractControl) => {
      return findUsers.fetch({ where: { username: { eq: control.value } } }).pipe(
        map(({ data }) => {
          return data.users?.length > 0 && data.users[0].username != differentTo?.username
            ? { usernameExists: true }
            : null;
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
  static emailExists(findUsers: FindUsers, differentTo?: User): AsyncValidatorFn {
    return (control: AbstractControl) => {
      return findUsers.fetch({ where: { email: { eq: control.value } } }).pipe(
        map(({ data }) => {
          return data?.users?.length > 0 && data.users[0].email != differentTo?.email ? { emailExists: true } : null;
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
}
