import { Injectable } from '@angular/core';
import { MnConfiguratorService } from '@modalnodes/mn-configurator';

export const CHCX_STATIC_FILE = '/assets/chcx-static.json';

@Injectable({
  providedIn: 'root'
})
export class ChcxConfiguratorService {

  constructor(
    private conf: MnConfiguratorService
  ) { }

  getRouteContent(name: string) {
    return this.conf.getConfiguration(name, CHCX_STATIC_FILE);
  }

  getRoutes() {
    const ret = [];
    for (const k of this.conf.getKeys(CHCX_STATIC_FILE)) {
      ret.push(this.getRouteContent(k));
    }
    return ret;
  }
}
