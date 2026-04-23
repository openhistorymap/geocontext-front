import { Directive, forwardRef, OnDestroy } from '@angular/core';
import maplibregl, { Map as MaplibreMap, StyleSpecification } from 'maplibre-gl';
import { MnMapComponent, MnMapFlavourDirective } from '@modalnodes/mn-geo';
import { isLayerDescriptor, LayerDescriptor } from '@modalnodes/mn-geo-layers';

/**
 * MapLibre-GL implementation of the MnGeoFlavour interface. Attach inside
 * a `<mn-map>` via `[mnMapFlavourMaplibre]`. The library name stays
 * `mn-geo-flavours-mapbox` for npm stability but the implementation is
 * MapLibre-GL — mapbox-gl v2+ is proprietary and we don't carry it.
 *
 * Coordinate convention: `center` on `<mn-map>` is [lon, lat], which is
 * what MapLibre expects — no swap.
 */
@Directive({
  selector: '[mnMapFlavourMaplibre]',
  standalone: true,
  providers: [
    {
      provide: MnMapFlavourDirective,
      useExisting: forwardRef(() => MnGeoFlavoursMaplibreDirective),
    },
  ],
})
export class MnGeoFlavoursMaplibreDirective extends MnMapFlavourDirective implements OnDestroy {
  private _map: MaplibreMap | undefined;
  private readonly ownedSourceIds = new Set<string>();
  private readonly ownedLayerIds = new Set<string>();

  get maplibreMap(): MaplibreMap | undefined {
    return this._map;
  }

  override setup(host: MnMapComponent): void {
    const element = host.getElement();
    if (!element) {
      throw new Error('mn-geo-flavours-mapbox: host <mn-map> has no rendered element');
    }

    const center = host.center() ?? [0, 0];
    const [lng, lat] = Array.isArray(center)
      ? center
      : [center.lon ?? center.lng ?? 0, center.lat ?? 0];

    const emptyStyle: StyleSpecification = {
      version: 8,
      sources: {},
      layers: [],
    };

    this._map = new maplibregl.Map({
      container: element,
      style: emptyStyle,
      center: [lng, lat],
      zoom: host.startzoom() ?? 3,
      minZoom: host.minzoom(),
      maxZoom: host.maxzoom(),
    });

    this._map.on('moveend', (e) => host.mapMoveEnd.emit(e));
    this._map.on('movestart', (e) => host.mapMoveStart.emit(e));

    this._map.once('load', () => host.ready());
  }

  override addLayer(input: unknown): void {
    if (!this._map) return;
    if (!isLayerDescriptor(input)) {
      console.warn(
        'mn-geo-flavours-mapbox: ignoring non-descriptor layer input. ' +
          'MapLibre requires LayerDescriptor; native renderer objects are not accepted.',
      );
      return;
    }
    this.fromDescriptor(input);
  }

  override removeLayer(input: unknown): void {
    if (!this._map) return;
    const id = typeof input === 'string' ? input : (input as { id?: string })?.id;
    if (!id) return;
    if (this.ownedLayerIds.has(id) && this._map.getLayer(id)) {
      this._map.removeLayer(id);
      this.ownedLayerIds.delete(id);
    }
    if (this.ownedSourceIds.has(id) && this._map.getSource(id)) {
      this._map.removeSource(id);
      this.ownedSourceIds.delete(id);
    }
  }

  override addDatasource(_ds: unknown): void {
    // no-op
  }
  override removeDatasource(_id: unknown): void {
    // no-op
  }

  ngOnDestroy(): void {
    this._map?.remove();
    this._map = undefined;
  }

  private fromDescriptor(desc: LayerDescriptor): void {
    const map = this._map!;
    switch (desc.kind) {
      case 'raster-tiles': {
        const id = desc.id;
        if (!map.getSource(id)) {
          map.addSource(id, {
            type: 'raster',
            tiles: desc.urls,
            tileSize: desc.tileSize ?? 256,
            minzoom: desc.minZoom,
            maxzoom: desc.maxZoom,
            attribution: desc.attribution,
          });
          this.ownedSourceIds.add(id);
        }
        if (!map.getLayer(id)) {
          map.addLayer({
            id,
            type: 'raster',
            source: id,
            minzoom: desc.minZoom,
            maxzoom: desc.maxZoom,
          });
          this.ownedLayerIds.add(id);
        }
        return;
      }

      case 'vector-tiles': {
        const id = desc.id;
        if (!map.getSource(id)) {
          map.addSource(id, {
            type: 'vector',
            tiles: desc.urls,
            minzoom: desc.minZoom,
            maxzoom: desc.maxZoom,
            attribution: desc.attribution,
          });
          this.ownedSourceIds.add(id);
        }
        for (const styleLayer of desc.styleLayers ?? []) {
          const layerId = styleLayer.id ?? `${id}-${this.ownedLayerIds.size}`;
          if (!map.getLayer(layerId)) {
            map.addLayer({ ...styleLayer, id: layerId, source: id });
            this.ownedLayerIds.add(layerId);
          }
        }
        return;
      }

      case 'geojson-features': {
        const id = desc.id;
        if (map.getSource(id)) {
          (map.getSource(id) as maplibregl.GeoJSONSource).setData(desc.data);
        } else {
          map.addSource(id, { type: 'geojson', data: desc.data });
          this.ownedSourceIds.add(id);
        }

        const circleId = `${id}-circle`;
        if (!map.getLayer(circleId)) {
          map.addLayer({
            id: circleId,
            type: 'circle',
            source: id,
            filter: ['==', ['geometry-type'], 'Point'],
            paint: {
              'circle-radius': desc.style?.options?.radius ?? 4,
              'circle-color': desc.style?.options?.fillColor ?? '#099092',
              'circle-stroke-color': desc.style?.options?.color ?? '#000',
              'circle-stroke-width': desc.style?.options?.weight ?? 1,
            },
          });
          this.ownedLayerIds.add(circleId);
        }
        const lineId = `${id}-line`;
        if (!map.getLayer(lineId)) {
          map.addLayer({
            id: lineId,
            type: 'line',
            source: id,
            filter: ['==', ['geometry-type'], 'LineString'],
            paint: {
              'line-color': desc.style?.options?.color ?? '#333',
              'line-width': desc.style?.options?.weight ?? 2,
            },
          });
          this.ownedLayerIds.add(lineId);
        }
        const fillId = `${id}-fill`;
        if (!map.getLayer(fillId)) {
          map.addLayer({
            id: fillId,
            type: 'fill',
            source: id,
            filter: ['==', ['geometry-type'], 'Polygon'],
            paint: {
              'fill-color': desc.style?.options?.fillColor ?? '#099092',
              'fill-opacity': desc.style?.options?.fillOpacity ?? 0.4,
            },
          });
          this.ownedLayerIds.add(fillId);
        }

        if (desc.onClick) {
          for (const sub of [circleId, lineId, fillId]) {
            map.on('click', sub, (e) => {
              const feat = e.features?.[0];
              if (feat) desc.onClick!(feat);
            });
          }
        }
        return;
      }
    }
  }
}
