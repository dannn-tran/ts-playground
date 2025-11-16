export interface Subscription {
  kill(): void;
}

export abstract class Signal<T> {
  #derivedSignals = new Set<DerivedSignal<any>>();
  #observers = new Set<Observer>();

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
  addObserver(fn: (value: T) => void): Subscription {
    const exec = () => fn(this.get());
    const observer = { exec };
    this.#observers.add(observer);

    observer.exec();

    const kill = () => this.#observers.delete(observer);
    return { kill };
  }

  protected addDependent(d: DerivedSignal<any>): void {
    this.#derivedSignals.add(d);
  }
  protected notifyDownstream(): void {
    this.#notifyDerivedSignals();
    this.#notifyObservers();
  }
  protected abstract onUpstreamUpdated(): void;

  #notifyDerivedSignals(): void {
    this.#derivedSignals.forEach(s => s.onUpstreamUpdated());
  }
  #notifyObservers(): void {
    this.#observers.forEach(o => o.exec());
  }
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
    this.notifyDownstream();
  }
}

interface Observer {
  exec(): void;
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
    this.notifyDownstream();
  }
  update(fn: (value: T) => T): void {
    this.set(fn(this.get()));
  }
  onUpstreamUpdated(): void {}
}
