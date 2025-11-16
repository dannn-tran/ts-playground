export abstract class Signal<T> {
  protected dependents = new Set<DerivedSignal<any>>();

  abstract get(): T;
  map<U>(fn: (value: T) => U): Signal<U> {
    const derived = new DerivedSignal(() => fn(this.get()));
    this.addDependent(derived);
    return derived;
  }
  combineWith<U>(other: Signal<U>): Signal<[T, U]> {
    return this.combineWithFn(other, (a, b) => [a, b] as [T, U]);
  }
  combineWithFn<U, V>(other: Signal<U>, fn: (a: T, b: U) => V): Signal<V> {
    const combined = new DerivedSignal(() => fn(this.get(), other.get()));
    this.addDependent(combined);
    other.addDependent(combined);
    return combined;
  }
  notifyDependents(): void {
    this.dependents.forEach((d) => d.onUpstreamUpdated());
  }

  protected addDependent(d: DerivedSignal<any>): void {
    this.dependents.add(d);
  }
  protected abstract onUpstreamUpdated(): void;
}

class DerivedSignal<T> extends Signal<T> {
  #inner: { isOutdated: true } | { isOutdated: false, value: T } = { isOutdated: true };

  constructor(protected fn: () => T) {
    super();
  }

  get(): T {
    if (this.#inner.isOutdated) {
      this.#inner = { isOutdated: false, value: this.fn() };
    }
    return this.#inner.value;
  }
  onUpstreamUpdated(): void {
    if (this.#inner.isOutdated)
      return;
    this.#inner = { isOutdated: true };
    this.notifyDependents();
  }
}

export class Var<T> extends Signal<T> {
  #value: T;

  constructor(initialValue: T) {
    super();
    this.#value = initialValue;
  }

  get(): T {
    return this.#value;
  }
  set(value: T): void {
    if (value === this.get())
      return;
    this.#value = value;
    this.notifyDependents();
  }
  update(fn: (value: T) => T): void {
    this.set(fn(this.get()));
  }
  onUpstreamUpdated(): void {}
}
