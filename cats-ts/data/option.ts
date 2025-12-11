import { left, right, type Either } from './either.js'
import { NoSuchElementError, NotImplementError } from './error.js'
import { identity } from './identity.js'
import type { List } from './list.js'
import { UNIT, type Unit } from './unit.js'

type SomeStruct<A> = {
  type: 'some'
  value: A
}
const NONE_STRUCT = {
  type: 'none' as const
}
type NoneStruct = typeof NONE_STRUCT

interface OptionOpsBase<A> {
  /** Returns the nested Option value if it is nonempty.. */
  fold<B>(ifEmpty: () => B, f: (a: A) => B): B
}
type OptionOps<A> = OptionOpsBase<A> & {
  /** Returns the option's value. */
  get(): A
  /** Tests whether the option contains a given value as an element. */
  contains(elem: A): boolean
  /** Returns true if this option is nonempty and the predicate p returns true when applied to this Option's value. */
  exists(p: (a: A) => boolean): boolean
  /** Returns this Option if it is nonempty and applying the predicate p to this Option's value returns true. */
  filter(p: (a: A) => boolean): Option<A>
  /** Returns this Option if it is nonempty and applying the predicate p to this Option's value returns false. */
  filterNot(p: (a: A) => boolean): Option<A>
  /** Returns the result of applying f to this Option's value if this Option is nonempty. */
  flatMap<B>(f: (a: A) => Option<B>): Option<B>
  /** Returns true if this option is empty or the predicate p returns true when applied to this Option's value. */
  forall(p: (a: A) => boolean): boolean
  /** Apply the given procedure f to the option's value, if it is nonempty. */
  foreach<U>(f: (a: A) => U): Unit
  /** Returns the option's value if the option is nonempty, otherwise return the result of evaluating defaultGetter. */
  getOrElse<B>(defaultGetter: () => A): A | B
  /** Returns true if the option is an instance of Some, false otherwise. */
  isDefined(): boolean
  /** Returns true if the option is None, false otherwise. */
  isEmpty(): boolean
  /** Returns a Some containing the result of applying f to this Option's value if this Option is nonempty. */
  map<B>(f: (a: A) => B): Option<B>
  /** Returns false if the option is None, true otherwise. */
  nonEmpty: () => boolean
  /** Returns this Option if it is nonempty, otherwise return the result of evaluating alternative. */
  orElse(alt: () => Option<A>): Option<A>
  orNull<A1>(): A | A1 | null
  /** Returns a Right containing the given argument right if this is empty, or a Left containing this Option's value if this Option is nonempty. */
  toLeft<X>(rightGetter: () => X): Either<A, X>
  /** Returns a singleton list containing the Option's value if it is nonempty, or the empty list if the Option is empty. */
  toList(): List<A>
  /** Returns a Left containing the given argument left if this scala.Option is empty, or a Right containing this Option's value if this is nonempty. */
  toRight<X>(leftGetter: () => X): Either<X, A>
  /** Returns a Some formed from this option and another option by combining the corresponding elements in a pair. */
  zip<A1, B>(that: Option<B>): Option<[A | A1, B]>
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

export function flattenOption<B, A extends Option<B>>(opt: Option<A>): Option<B> {
  return opt.flatMap(identity)
}

function augment<A>(base: (SomeStruct<A> | NoneStruct) & OptionOpsBase<A>): Option<A> {
  function exists(p: (a: A) => boolean): boolean {
    return base.fold(() => false, p)
  }
  function filter(p: (a: A) => boolean): Option<A> {
    return base.fold(() => none(), a => p(a) ? some(a) : none())
  }
  function flatMap<B>(f: (a: A) => Option<B>): Option<B> {
    return base.fold(() => none(), f)
  }
  function isDefined() {
    return base.fold(() => false, _ => true)
  }
  function toLeft<X>(rightGetter: () => X): Either<A, X> {
    return base.fold(() => right(rightGetter()), a => left(a))
  }
  function toRight<X>(leftGetter: () => X): Either<X, A> {
    return base.fold(() => left(leftGetter()), a => right(a))
  }
  return {
    ...base,
    contains: elem => base.fold(() => false, a => a === elem),
    exists,
    filter,
    filterNot: p => filter(a => !p(a)),
    flatMap,
    forall: exists,
    foreach: f => {
      base.fold(() => {}, a => { f(a) })
      return UNIT
    },
    get: () => base.fold(() => { throw new NoSuchElementError() }, identity),
    getOrElse: defaultValue => base.fold(defaultValue, identity),
    isDefined,
    isEmpty: () => !isDefined(),
    map: f => base.fold(() => none(), a => some(f(a))),
    nonEmpty: isDefined,
    orElse: alt => base.fold(alt, some),
    orNull: () => base.fold(() => null, identity),
    toLeft,
    toList: () => { throw new NotImplementError() },
    toRight,
    zip: that => flatMap(a => that.map(b => [a, b]))
  }
}
