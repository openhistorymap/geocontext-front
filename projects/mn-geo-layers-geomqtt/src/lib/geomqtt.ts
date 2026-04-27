import mqtt, { MqttClient } from 'mqtt';
import { Layer, GeoJsonFeaturesDescriptor } from '@openhistorymap/mn-geo-layers';

export interface GeoMqttConf {
  broker: string;
  topic: string | string[];
  options?: Parameters<typeof mqtt.connect>[1];
  /** Cap in-memory features to avoid unbounded growth on high-rate topics. */
  maxFeatures?: number;
  /** If messages carry a persistent id, use it to replace previous markers. */
  idField?: string;
  /** Optional GeoJSON-layer style hint passed through to the flavour. */
  style?: any;
}

/**
 * Subscribes to one or more MQTT topics, decodes incoming GeoJSON Feature /
 * FeatureCollection payloads, and pushes accumulated FeatureCollections into
 * the active flavour through the descriptor's `subscribe` channel. Works on
 * any flavour that supports the live-update protocol (Leaflet, MapLibre).
 *
 * The MQTT client lives for the duration of the subscription; the flavour
 * calls the returned teardown thunk when the layer is removed.
 */
export class GeoMqttLayer extends Layer {
  constructor() {
    super();
    this.setRequiresDatasources(false);
  }

  override create(): GeoJsonFeaturesDescriptor {
    const conf = (this.getConfiguration() ?? {}) as GeoMqttConf;
    if (!conf.broker) {
      throw new Error('GeoMqttLayer: configuration requires a `broker` URL (ws/wss).');
    }

    return {
      kind: 'geojson-features',
      id: this.getName() || 'geomqtt',
      data: { type: 'FeatureCollection', features: [] },
      style: conf.style,
      onClick: (feature: any) => this.featureClicked(feature),
      subscribe: (push) => this.connect(conf, push),
    };
  }

  private connect(conf: GeoMqttConf, push: (data: any) => void): () => void {
    const features = new Map<string, any>();
    let anonId = 0;
    const decoder = new TextDecoder();

    const client: MqttClient = mqtt.connect(conf.broker, conf.options);
    const topics = Array.isArray(conf.topic) ? conf.topic : [conf.topic];

    client.on('connect', () => {
      for (const t of topics) client.subscribe(t);
    });

    client.on('message', (_topic, payload) => {
      let body: any;
      try {
        body = JSON.parse(decoder.decode(payload));
      } catch {
        return;
      }
      const incoming: any[] =
        body?.type === 'FeatureCollection' ? body.features ?? [] : [body];

      let dirty = false;
      for (const feature of incoming) {
        if (!feature || feature.type !== 'Feature') continue;
        const id =
          conf.idField && feature.properties?.[conf.idField] != null
            ? String(feature.properties[conf.idField])
            : `__anon_${anonId++}`;
        features.set(id, feature);
        if (conf.maxFeatures && features.size > conf.maxFeatures) {
          // drop the oldest insertion order to bound memory
          const firstKey = features.keys().next().value as string | undefined;
          if (firstKey !== undefined) features.delete(firstKey);
        }
        dirty = true;
      }
      if (dirty) {
        push({ type: 'FeatureCollection', features: Array.from(features.values()) });
      }
    });

    client.on('error', (err) => console.warn('GeoMqttLayer: MQTT error', err));

    return () => {
      try {
        client.end(true);
      } catch {
        // ignore
      }
      features.clear();
    };
  }
}
