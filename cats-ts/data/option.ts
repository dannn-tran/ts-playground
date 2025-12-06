import { NoSuchElementError } from './error.js'

type SomeStruct<A> = {
  type: 'some'
  value: A
}
const NoneStruct = {
  type: 'none' as const
}

interface OptionOps<A> {
  contains(elem: A): boolean
  exists(p: (a: A) => boolean): boolean
  filter(p: (a: A) => boolean): Option<A>
  filterNot(p: (a: A) => boolean): Option<A>
  flatMap<B>(f: (a: A) => Option<B>): Option<B>
  fold<B>(ifEmpty: () => B, f: (a: A) => B): B
  forall(p: (a: A) => boolean): boolean
  foreach(f: (a: A) => void): void
  get(): A
  getOrElse(defaultValue: () => A): A
  isDefined(): boolean
  isEmpty(): boolean
  map<B>(f: (a: A) => B): Option<B>
  orElse(alt: () => Option<A>): Option<A>
}

type Some<A> = SomeStruct<A> & OptionOps<A>
type None<A> = typeof NoneStruct & OptionOps<A>
export type Option<A> = Some<A> | None<A>

export function option<A>(a: A): Option<A> {
  return (a === null || a === undefined)
    ? none()
    : some(a)
}

export function some<A>(value: A): Option<A> {
  return {
    type: 'some',
    value,
    contains: elem => value === elem,
    exists: p => p(value),
    filter: p => p(value) ? some(value) : none(),
    filterNot: p => p(value) ? none() : some(value),
    flatMap: f => f(value),
    fold: (_, f) => f(value),
    forall: p => p(value),
    foreach: f => f(value),
    get: () => value,
    getOrElse: _ => value,
    isDefined: () => true,
    isEmpty: () => false,
    map: f => some(f(value)),
    orElse: _ => some(value)
  }
}

export function none<A>(): Option<A> {
  return {
    type: 'none',
    contains: _ => false,
    exists: _ => false,
    filter: _ => none(),
    filterNot: _ => none(),
    flatMap: _ => none(),
    fold: (ifEmpty, _) => ifEmpty(),
    forall: _ => false,
    foreach: _ => {},
    get: () => { throw new NoSuchElementError() },
    getOrElse: d => d(),
    isDefined: () => false,
    isEmpty: () => true,
    map: _ => none(),
    orElse: alt => alt()
  }
}
