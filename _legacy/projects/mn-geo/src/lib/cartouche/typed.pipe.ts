import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'typed'
})
export class TypedPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return value.split(',');
  }

}
