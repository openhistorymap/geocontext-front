import { MnDockerModule } from '@modalnodes/mn-docker';
import { NgModule } from '@angular/core';
import { MnMapglModule} from '@modalnodes/mn-mapgl';
import { GcxMainComponent } from './gcx-main/gcx-main.component';

@NgModule({
  imports: [
    MnDockerModule,
    MnMapglModule
  ],
  declarations: [GcxMainComponent],
  exports: [GcxMainComponent]
})
export class GcxCoreModule { }
