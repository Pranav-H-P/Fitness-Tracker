import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const nonEmptyArrayValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const array = control.value;
  return Array.isArray(array) && array.length > 0
    ? null
    : { nonEmptyArray: true };
};
