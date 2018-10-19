import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filesize'
})
export class FilesizePipe implements PipeTransform {

  units = {
    1024: ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
    1000: ['kb', 'Mb', 'Gb', 'Tb', 'Pb', 'Eb', 'Zb', 'Yb'],
  };

  transform(value: number, precision: number = 2, multiplier: number = 1024, units?: string[]): any {
    const tunits = this.units[multiplier];
    let ret = value;
    let idx = 0;
    while (ret > multiplier && idx < tunits.length) {
      idx ++;
      ret = ret / multiplier;
    }
    return ret + ' ' + tunits[idx];
  }

}
