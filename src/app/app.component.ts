import { Component, computed, effect, inject } from '@angular/core';
import { GcxCoreService, GcxMainComponent, GcxRouteItem } from '@openhistorymap/gcx-core';
import { ChcxStaticService } from '@openhistorymap/chcx-static';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GcxMainComponent],
  template: `<gcx-main [title]="title()" [items]="items()" />`,
})
export class AppComponent {
  private readonly gcx = inject(GcxCoreService);
  private readonly chcxStatic = inject(ChcxStaticService);

  readonly title = computed<string>(() => this.gcx.config()?.title ?? 'GeoContext');

  readonly items = computed<GcxRouteItem[]>(() => {
    const pages = this.chcxStatic.pages() ?? {};
    return Object.values(pages).map((p) => ({
      target: p.target,
      title: p.title ?? p.target,
      icon: p.icon,
    }));
  });

  constructor() {
    // Reload the static-page registry whenever the repo context changes.
    // ChcxStaticService probes jsdelivr (geocontext-static.json then
    // chcx-static.json) when GcxCoreService.currentRepo() is set,
    // /assets/chcx-static.json otherwise — re-running load() picks up the
    // new source automatically.
    effect(() => {
      this.gcx.currentRepo();
      void this.chcxStatic.load();
    });
  }
}
