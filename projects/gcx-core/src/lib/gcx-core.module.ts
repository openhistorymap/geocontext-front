import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MnDockerModule } from '@modalnodes/mn-docker';
import { MnMapglModule} from '@modalnodes/mn-mapgl';
import { MnGeoModule } from '@modalnodes/mn-geo';

import { GcxMainComponent } from './gcx-main/gcx-main.component';

@NgModule({
  imports: [
    CommonModule,
    //MnDockerModule,
    MnGeoModule,
    MnMapglModule,
  ],
  declarations: [GcxMainComponent],
  exports: [GcxMainComponent]
})
export class GcxCoreModule { }
