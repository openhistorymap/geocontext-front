import { MnConfiguratorService } from '@modalnodes/mn-configurator';
import { Observable, BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

export const GCX_CORE_FILE = '/assets/gcx.json';

@Injectable({
  providedIn: 'root'
})
export class GcxCoreService {

  private is_open = false;
  private sidebarToggledSource = new BehaviorSubject<boolean>(this.is_open);
  public sidebarToggled = this.sidebarToggledSource.asObservable();

  constructor(
    private conf: MnConfiguratorService
  ) { }

  public toggleSidebar() {
    this.is_open = !this.is_open;
    this.sidebarToggledSource.next(this.is_open);
  }

  public openSidebar() {
    this.is_open = true;
    this.sidebarToggledSource.next(this.is_open);
  }

  public getConf(name: string) {
    return this.conf.getConfiguration(name, GCX_CORE_FILE);
  }
}
