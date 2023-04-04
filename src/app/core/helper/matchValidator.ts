import { FormGroup } from '@angular/forms';

export function matchValidator( data: string, confirmdata: string ) {
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

export function matchTextValidator( data: string, comfirText: string ) {
    return ( formGroup: FormGroup ) => {
      const dataControl = formGroup.controls[data];;
      if ( dataControl.value === comfirText) {
        dataControl.setErrors({ match: true });
      } else {
        dataControl.setErrors(null);
      }
    }
  }