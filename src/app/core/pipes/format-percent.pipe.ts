import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatPercent'
})
export class FormatPercentPipe implements PipeTransform {

  transform(value: string): string {
    value = value.replace("%","");
    
    let symbol = "%";
    if(value){
      value = value.replace("%","");
      value = value.replace(" ","");
    }else{
      symbol = "";
    }
    
    return value+symbol;
  }

}
