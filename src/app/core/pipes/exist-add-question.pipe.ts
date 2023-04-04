import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'existAddQuestion'
})
export class ExistAddQuestionPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
