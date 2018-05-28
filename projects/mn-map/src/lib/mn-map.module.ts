import { NgModule } from '@angular/core';
import { MnMapComponent } from './mn-map.component';
import { MnMap2dDirective } from './mn-map-2d.directive';

@NgModule({
  imports: [
  ],
  declarations: [MnMapComponent, MnMap2dDirective],
  exports: [MnMapComponent, MnMap2dDirective]
})
export class MnMapModule { }
