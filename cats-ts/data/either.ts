import { NotImplementError } from './error.js'
import { identity } from './identity.js'
import { none, some, type Option } from './option.js'
import type { Seq } from './seq.js'
import { UNIT, type Unit } from './unit.js'

interface LeftStruct<A> {
  type: 'left',
  value: A
}
interface RightStruct<B> {
  type: 'right',
  value: B
}
interface EitherOpsBase<A, B> {
  /** Applies fa if this is a Left or fb if this is a Right. */
  fold<C>(fa: (a: A) => C, fb: (b: B) => C): C
}
type EitherOps<A, B> = EitherOpsBase<A, B> & {
  /** Returns true if this is a Left, false otherwise. */
  isLeft(): boolean
  /** Returns true if this is a Right, false otherwise. */
  isRight(): boolean
  /** Returns true if this is a Right and its value is equal to elem (as determined by ==), returns false otherwise. */
  contains(elem: B): boolean
  /** Returns false if Left or returns the result of the application of the given predicate to the Right value. */
  exists(p: (b: B) => boolean): boolean
  /** Returns Right with the existing value of Right if this is a Right and the given predicate p holds for the right value, or Left(zero) if this is a Right and the given predicate p does not hold for the right value, or Left with the existing value of Left if this is a Left. */
  filterOrElse<A1>(p: (b: B) => boolean, zero: () => A1): Either<A | A1, B>
  /** Binds the given function across Right. */
  flatMap<A1, B1>(f: (b: B) => Either<A1, B1>): Either<A | A1, B1>
  /** Returns true if Left or returns the result of the application of the given predicate to the Right value. */
  forall(f: (b: B) => boolean): boolean
  /** Executes the given side-effecting function if this is a Right. */
  foreach<U>(f: (b: B) => U): Unit
  /** Returns the value from this Right or the given argument if this is a Left. */
  getOrElse<B1>(or: () => B1): B | B1
  /** Projects this Either as a Left. */
  left(): LeftProjection<A, B>
  /** The given function is applied if this is a Right. */
  map<B1>(f: (b: B) => B1): Either<A, B | B1>
  /** Returns this Right or the given argument if this is a Left. */
  orElse<A1, B1>(or: () => Either<A1, B1>): Either<A | A1, B | B1>
  /** If this is a Left, then return the left value in Right or vice versa. */
  swap(): Either<B, A>
  /** Returns a Some containing the Right value if it exists or a None if this is a Left. */
  toOption(): Option<B>
  /** Returns a Seq containing the Right value if it exists or an empty Seq if this is a Left. */
  toSeq() : Seq<B>
}

export type Left<A, B> = LeftStruct<A> & EitherOps<A, B>
export type Right<A, B> = RightStruct<B> & EitherOps<A, B>
export type Either<A, B> = Left<A, B> | Right<A, B>

export type LeftProjection<A, B> = {
  type: 'left-projection'
  e: Either<A, B>
  /** Returns false if Right or returns the result of the application of the given function to the Left value. */
  exists(p: (a: A) => boolean): boolean
  /** Returns None if this is a Right or if the given predicate p does not hold for the left value, otherwise, returns a Left. */
  filterToOption<B1>(p: (a: A) => boolean): Option<Either<A, B1>>
  /** Binds the given function across Left. */
  flatMap<A1, B1>(f: (a: A) => Either<A1, B1>): Either<A1, B | B1>
  /** Returns true if Right or returns the result of the application of the given function to the Left value. */
  forall(p: (a: A) => boolean): boolean
  /** Executes the given side-effecting function if this is a Left. */
  foreach<U>(f: (a: A) => U): Unit
  /** Returns the value from this Left or the given argument if this is a Right. */
  getOrElse<A1>(or: () => A1): A | A1
  /** Maps the function argument through Left. */
  map<A1>(f: (a: A) => A1): Either<A | A1, B>
  /** Returns a Some containing the Left value if it exists or a None if this is a Right. */
  toOption(): Option<A>
  /** Returns a Seq containing the Left value if it exists or an empty Seq if this is a Right. */
  toSeq(): Seq<A>
}

export function left<A, B>(a: A): Either<A, B> {
  return augment({
    type: 'left',
    value: a,
    fold: (fa, _) => fa(a)
  })
}

export function right<A, B>(b: B): Either<A, B> {
  return augment({
    type: 'right',
    value: b,
    fold: (_, fb) => fb(b)
  })
}

/** Returns the right value if this is right or this value if this is left */
export function flattenEither<A1, B1, A extends A1, B extends Either<A1, B1>>(either: Either<A, B>): Either<A1, B1> {
  return either.flatMap(identity)
}

/** Joins an Either through Left. */
export function joinLeft<B1, B extends B1, C, A extends Either<C, B1>>(either: Either<A, B>): Either<C, B1> {
  return either.left().flatMap(identity)
}

/** Joins an Either through Right. */
export function joinRight<A1, A extends A1, C, B extends Either<A1, C>>(either: Either<A, B>): Either<A1, C> {
  return flattenEither(either)
}

function augment<A, B>(base: (LeftStruct<A> | RightStruct<B>) & EitherOpsBase<A, B>): Either<A, B> {
  function isLeft() {
    return base.fold(_ => true, _ => false)
  }
  function exists(p: (b: B) => boolean) {
    return base.fold(_ => false, p)
  }
  function flatMap<A1, B1>(f: (b: B) => Either<A1, B1>) {
    return base.fold(a => left<A | A1, B1>(a), f)
  }
  function getOrElse<B1>(or: () => B1): B | B1 {
    return base.fold(_ => or() as B | B1, identity)
  }
  function orElse<A1, B1>(or: () => Either<A1, B1>): Either<A | A1, B | B1> {
    return base.fold(_ => or() as Either<A | A1, B | B1>, right)
  }
  return {
    ...base,
    isLeft,
    isRight: () => !isLeft(),
    contains: elem => base.fold(_ => false, b => b === elem),
    exists,
    filterOrElse: (p, zero) => base.fold(a => left(a), b => p(b) ? right(b) : left(zero())),
    flatMap,
    forall: exists,
    foreach: f => {
      base.fold(_ => {}, b => { f(b) })
      return UNIT
    },
    getOrElse,
    left: () => leftProjection(augment(base)),
    map: f => base.fold(a => left(a), b => right(f(b))),
    orElse,
    swap: () => base.fold(a => right(a), b => left(b)),
    toOption: () => base.fold(_ => none(), some),
    toSeq: () => { throw new NotImplementError() }
  }
}

function leftProjection<A, B>(e: Either<A, B>): LeftProjection<A, B> {
  function flatMap<A1, B1>(f: (a: A) => Either<A1, B1>): Either<A1, B | B1> {
    return e.fold(a => f(a) as Either<A1, B | B1>, right)
  }
  function getOrElse<A1>(or: () => A1): A | A1 {
    return e.fold(a => a as A | A1, _ => or())
  }
  return {
    type: 'left-projection',
    e,
    exists: p => e.fold(p, _ => false),
    filterToOption: p => e.fold(a => p(a) ? some(left(a)) : none(), _ => none()),
    flatMap,
    forall: p => e.fold(p, _ => false),
    foreach: f => {
      e.fold(a => { f(a) }, _ => {})
      return UNIT
    },
    getOrElse,
    map: f => e.fold(a => left(f(a)), b => right(b)),
    toOption: () => e.fold(a => some(a), _ => none()),
    toSeq: () => { throw new NotImplementError() }
  }
}