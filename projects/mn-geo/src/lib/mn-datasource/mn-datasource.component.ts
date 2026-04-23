import { Component, input } from '@angular/core';

/**
 * Declarative datasource entry projected into `<mn-map>`. The map container
 * collects these and forwards them to `DatasourcesmanagerService` during
 * `ready()`.
 */
@Component({
  selector: 'mn-datasource',
  standalone: true,
  template: '',
})
export class MnDatasourceComponent {
  readonly name = input<string>('');
  readonly type = input<string>('');
  readonly conf = input<any>({});
}
