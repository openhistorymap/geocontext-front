import { Injectable } from '@angular/core';
import { MnConfiguratorService } from '@modalnodes/mn-configurator';

@Injectable({
  providedIn: 'root'
})
export class ChcxConfiguratorService {

  constructor(
    private conf: MnConfiguratorService
  ) { }

  getRoutes() {

  }
}
