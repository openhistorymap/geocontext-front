import { Injectable } from '@angular/core';

/**
 * Keyed in-memory store for plugin-style lookups. Consumers extend this and
 * (optionally) override `for()` to transform the stored value at read time
 * (e.g. to instantiate a registered class).
 */
@Injectable({ providedIn: 'root' })
export class MnRegistryService<T> {
  private readonly _items = new Map<string, T>();

  register(name: string, value: T): void {
    this._items.set(name, value);
  }

  for(name: string): T {
    const value = this._items.get(name);
    if (value === undefined) {
      throw new Error(`MnRegistryService: no entry registered for "${name}"`);
    }
    return value;
  }

  has(name: string): boolean {
    return this._items.has(name);
  }

  names(): string[] {
    return Array.from(this._items.keys());
  }

  unregister(name: string): void {
    this._items.delete(name);
  }
}
