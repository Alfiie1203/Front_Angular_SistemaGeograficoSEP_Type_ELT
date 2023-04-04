import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'changeTitle'
})
export class ChangeTitlePipe implements PipeTransform {

  transform(value: string): string {
    const title = value.split(" ");
    if(title.length>1){
      let tempText = title.pop();
      title.push(`<span class="color-title">${tempText}</span>`);
    }
    return title.join(' ');
  }

}
