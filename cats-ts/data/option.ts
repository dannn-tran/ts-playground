import { NoSuchElementError } from './error.js'

type SomeStruct<A> = {
  type: 'some'
  value: A
}
const NONE_STRUCT = {
  type: 'none' as const
}
type NoneStruct = typeof NONE_STRUCT

interface OptionOpsBase<A> {
  fold<B>(ifEmpty: () => B, f: (a: A) => B): B
}
type OptionOps<A> = OptionOpsBase<A> & {
  contains(elem: A): boolean
  exists(p: (a: A) => boolean): boolean
  filter(p: (a: A) => boolean): Option<A>
  filterNot(p: (a: A) => boolean): Option<A>
  flatMap<B>(f: (a: A) => Option<B>): Option<B>
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
type None<A> = typeof NONE_STRUCT & OptionOps<A>
export type Option<A> = Some<A> | None<A>

export function option<A>(a: A): Option<A> {
  return (a === null || a === undefined)
    ? none()
    : some(a)
}

export function some<A>(value: A): Option<A> {
  return augment({
    type: 'some',
    value,
    fold: (_, f) => f(value)
  })
}

export function none<A>(): Option<A> {
  return augment({
    type: 'none',
    fold: (ifEmpty, _) => ifEmpty()
  })
}


function augment<A>(base: (SomeStruct<A> | NoneStruct) & OptionOpsBase<A>): Option<A> {
  function exists(p: (a: A) => boolean): boolean {
    return base.fold(() => false, p)
  }
  function filter(p: (a: A) => boolean): Option<A> {
    return base.fold(() => none(), a => p(a) ? some(a) : none())
  }
  function isDefined() {
    return base.fold(() => false, _ => true)
  }
  return {
    ...base,
    contains: elem => base.fold(() => false, a => a === elem),
    exists,
    filter,
    filterNot: p => filter(a => !p(a)),
    flatMap: f => base.fold(() => none(), f),
    forall: exists,
    foreach: f => base.fold(() => {}, f),
    get: () => base.fold(() => { throw new NoSuchElementError() }, a => a),
    getOrElse: defaultValue => base.fold(defaultValue, a => a),
    isDefined,
    isEmpty: () => !isDefined(),
    map: f => base.fold(() => none(), a => some(f(a))),
    orElse: alt => base.fold(alt, some)
  }
}
