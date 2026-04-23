import * as L from 'leaflet';
import mqtt, { MqttClient } from 'mqtt';
import { Layer } from '@modalnodes/mn-geo-layers';

export interface GeoMqttConf {
  broker: string;
  topic: string | string[];
  options?: Parameters<typeof mqtt.connect>[1];
  /** Optional: cap in-memory features to avoid unbounded growth on high-rate topics. */
  maxFeatures?: number;
  /** Optional: if messages carry a persistent id, use it to replace previous markers. */
  idField?: string;
  /** Optional: Leaflet GeoJSON options applied to each incoming feature. */
  geoJsonOptions?: L.GeoJSONOptions;
}

/**
 * Subscribes to one or more MQTT topics and renders incoming GeoJSON
 * Feature / FeatureCollection payloads as a single Leaflet featureGroup.
 * The connection lives for the lifetime of the layer; callers discard
 * the layer (via LayersmanagerService) to drop the subscription.
 */
export class GeoMqttLayer extends Layer {
  private readonly group: L.FeatureGroup = L.featureGroup();
  private client: MqttClient | null = null;
  private readonly byId = new Map<string, L.Layer>();

  constructor() {
    super();
    this.setRequiresDatasources(false);
  }

  override create(): L.Layer {
    const conf = (this.getConfiguration() ?? {}) as GeoMqttConf;
    if (!conf.broker) {
      throw new Error('GeoMqttLayer: configuration requires a `broker` URL (ws/wss)');
    }

    this.client = mqtt.connect(conf.broker, conf.options);
    this.client.on('connect', () => {
      const topics = Array.isArray(conf.topic) ? conf.topic : [conf.topic];
      for (const t of topics) this.client!.subscribe(t);
    });
    this.client.on('message', (_topic, payload) => {
      this.ingest(payload, conf);
    });
    this.client.on('error', (err) => {
      console.warn('GeoMqttLayer: MQTT error', err);
    });

    return this.group;
  }

  private ingest(payload: Uint8Array, conf: GeoMqttConf): void {
    let body: any;
    try {
      body = JSON.parse(new TextDecoder().decode(payload));
    } catch {
      return;
    }

    const features: any[] =
      body?.type === 'FeatureCollection' ? body.features ?? [] : [body];

    for (const feature of features) {
      if (!feature || feature.type !== 'Feature') continue;

      const id =
        conf.idField && feature.properties?.[conf.idField] != null
          ? String(feature.properties[conf.idField])
          : undefined;

      if (id && this.byId.has(id)) {
        this.group.removeLayer(this.byId.get(id)!);
        this.byId.delete(id);
      }

      const layer = L.geoJSON(feature, conf.geoJsonOptions);
      this.group.addLayer(layer);
      if (id) this.byId.set(id, layer);

      if (conf.maxFeatures && this.group.getLayers().length > conf.maxFeatures) {
        const oldest = this.group.getLayers()[0];
        this.group.removeLayer(oldest);
      }
    }
  }
}
