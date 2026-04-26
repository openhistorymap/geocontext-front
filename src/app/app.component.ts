import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { GcxMainComponent, GcxRouteItem } from '@openhistorymap/gcx-core';

interface StaticPage {
  target: string;
  title: string;
  icon?: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GcxMainComponent],
  template: `<gcx-main [title]="title()" [items]="items()" />`,
})
export class AppComponent implements OnInit {
  private readonly http = inject(HttpClient);

  readonly title = signal<string>('GeoContext');
  readonly items = signal<GcxRouteItem[]>([]);

  async ngOnInit(): Promise<void> {
    try {
      const pages = await firstValueFrom(
        this.http.get<Record<string, StaticPage>>('/assets/chcx-static.json')
      );
      this.items.set(Object.values(pages ?? {}));
    } catch {
      // Config absent during early rewrite — toolbar still shows Map.
    }
  }
}
