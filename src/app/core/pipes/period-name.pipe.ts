import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'periodName'
})
export class PeriodNamePipe implements PipeTransform {

  private listPeriod:Array<any> = [
    {
      id: 0,
      name: 'ANNUAL',
    },
    {
      id: 1,
      name: 'BIANNUAL_1',
    },
    {
      id: 2,
      name: 'BIANNUAL_2',
    },
  ];
  transform(value: number): string {
    if(value != undefined && value != null ){
      let period:any = this.listPeriod.filter(el => el.id == value);
      if(period && period.length)
      return period[0].name;
      else
      return `N/A (${value})`;
    }
    return `N/A (${value})`;
  }

}
