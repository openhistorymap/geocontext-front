import { DatasourceDirective } from './datasource.directive';
import { Directive, forwardRef, Input } from '@angular/core';

@Directive({
  selector: '[geojson]',
  providers: [{provide: DatasourceDirective, useExisting: forwardRef(() => JsonDirective)}]

})
export class JsonDirective extends DatasourceDirective {

  @Input() source;
  constructor() {
    super();
  }

}
