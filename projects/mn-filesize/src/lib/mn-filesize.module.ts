import { NgModule } from '@angular/core';
import { FilesizePipe } from './filesize.pipe';

@NgModule({
  imports: [
  ],
  declarations: [FilesizePipe],
  exports: [FilesizePipe]
})
export class MnFilesizeModule { }
