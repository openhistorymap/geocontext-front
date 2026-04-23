import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export const GCX_CORE_FILE = '/assets/gcx.json';

export interface GcxConfig {
  title?: string;
  type?: string;
  center?: [number, number] | { lat: number; lon: number };
  minzoom?: number;
  startzoom?: number;
  maxzoom?: number;
  search?: boolean;
  datasources?: any[];
  layers?: any[];
  [k: string]: any;
}

@Injectable({ providedIn: 'root' })
export class GcxCoreService {
  private readonly http = inject(HttpClient);

  readonly sidebarOpen = signal(false);

  private _config: GcxConfig | null = null;
  private _pending: Promise<GcxConfig> | null = null;

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }
  openSidebar(): void {
    this.sidebarOpen.set(true);
  }
  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  async load(file: string = GCX_CORE_FILE): Promise<GcxConfig> {
    if (this._config) return this._config;
    if (!this._pending) {
      this._pending = firstValueFrom(this.http.get<GcxConfig>(file)).then((cfg) => {
        this._config = cfg ?? {};
        return this._config;
      });
    }
    return this._pending;
  }

  getConf<T = any>(key: string): T | undefined {
    return this._config?.[key] as T | undefined;
  }

  snapshot(): GcxConfig | null {
    return this._config;
  }
}
