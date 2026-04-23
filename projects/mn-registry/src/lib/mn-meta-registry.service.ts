import { Injectable } from '@angular/core';
import { MnRegistryService } from './mn-registry.service';

type AnyRegistry = MnRegistryService<unknown>;

/**
 * Registry of registries. Lets plugin infrastructure discover registries by
 * stable key, by display name, or by semantic tag without direct imports.
 */
@Injectable({ providedIn: 'root' })
export class MnMetaRegistryService {
  private readonly _byKey = new Map<string, AnyRegistry>();
  private readonly _byName = new Map<string, AnyRegistry>();
  private readonly _byTag = new Map<string, Set<AnyRegistry>>();

  register(key: string, registry: AnyRegistry): void {
    this._byKey.set(key, registry);
  }

  registerName(name: string, registry: AnyRegistry): void {
    this._byName.set(name, registry);
  }

  registerTags(tags: readonly string[], registry: AnyRegistry): void {
    for (const tag of tags) {
      let set = this._byTag.get(tag);
      if (!set) {
        set = new Set();
        this._byTag.set(tag, set);
      }
      set.add(registry);
    }
  }

  for(key: string): AnyRegistry | undefined {
    return this._byKey.get(key);
  }

  byName(name: string): AnyRegistry | undefined {
    return this._byName.get(name);
  }

  byTag(tag: string): AnyRegistry[] {
    const set = this._byTag.get(tag);
    return set ? Array.from(set) : [];
  }
}
