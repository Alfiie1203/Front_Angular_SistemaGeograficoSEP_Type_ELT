import { Injectable } from '@angular/core';
import { FormGroup, FormControl, ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class CustomValidatorsService {

  constructor() { }

  validateEquals( data: string, confirmdata: string ) {
    return ( formGroup: FormGroup ) => {
      const dataControl = formGroup.controls[data];
      const confirmDataControl = formGroup.controls[confirmdata];
      if ( dataControl.value === confirmDataControl.value ) {
        confirmDataControl.setErrors(null);
      } else {
        confirmDataControl.setErrors({ match: true });
      }
    }
  }

  static patternValidator(regex: RegExp, error: ValidationErrors): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (!control.value) {
        // if control is empty return no error
        return null  as any;
      }
  
      // test the value of the control against the regexp supplied
      const valid = regex.test(control.value);
  
      // if true, return no error (no error), else return error passed in the second parameter
      return valid ? null as any : error;
    };
  }

  matchTextValidator( data: string, comfirText: string ) {
    return ( formGroup: FormGroup ) => {
      const dataControl = formGroup.controls[data];;
      if ( dataControl.value === comfirText) {
        dataControl.setErrors({ match: true });
      } else {
        dataControl.setErrors(null);
      }
    }
  }
  
}
