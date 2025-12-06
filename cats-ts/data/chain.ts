import { NotImplementError } from './error.js'
import { none, some, type Option } from './option.js'

const EmptyStruct = {
  type: 'empty' as const
}

type SingletonStruct<A> = {
  type: 'singleton'
  a: A
}

type AppendStruct<A> = {
  type: 'append'
  leftNE: NonEmptyChain<A>,
  rightNE: NonEmptyChain<A>
}

/**
 * Trivial catenable sequence.
 * Supports O(1) append, and (amortized) O(1) uncons, such that
 * walking the sequence via N successive uncons steps takes O(N).
 * https://www.javadoc.io/static/org.typelevel/cats-docs_2.13/2.13.0/cats/data/Chain$.html
 */
interface ChainOps<A> {
  /**
   * Returns a new Chain consisting of this followed by a.
   * @param a 
   */
  append(a: A): Chain<A>
  /**
   * Concatenates this with c in O(1) runtime.
   * @param c 
   */
  concat(c: Chain<A>): Chain<A>
  /**
   * Check whether an element is in this structure
   * @param a 
   */
  contains(a: A): boolean
  /**
   * Yields to Some(a, Chain[A]) with a removed where f holds 
   * for the first time, otherwise yields None, if a was not 
   * found Traverses only until a is found.
   * @param f 
   */
  deleteFirst(f: (a: A) => boolean): Option<[A, Chain<A>]>
  /**
   * Remove duplicates.
   */
  distinct(): Chain<A>
  /**
   * Remove duplicates by a predicate.
   * @param f 
   */
  distinctBy<B>(f: (a: A) => B): Chain<A>
  /**
   * Drop a certain amount of items from the front of the Chain
   * @param count 
   */
  drop(count: number): Chain<A>
  /**
   * Drop a certain amount of items from the back of the Chain
   * @param count 
   */
  dropRight(count: number): Chain<A>
  /**
   * Drops longest prefix of elements that satisfy a predicate.
   * @param p 
   */
  dropWhile(p: (a: A) => boolean): Chain<A>
  /**
   * Typesafe equality operator.
   * @param that 
   */
  exists(f: (a: A) => boolean): boolean
  /**
   * Remove elements not matching the predicate
   * @param f 
   */
  filter(f: (a: A) => boolean): Chain<A>
  /**
   * Remove elements matching the predicate
   * @param f 
   */
  filterNot(f: (a: A) => boolean): Chain<A>
  /**
   * Find the first element matching the predicate, if one exists
   * @param f 
   */
  find(f: (a: A) => boolean): Option<A>
  /**
   * Applies the supplied function to each element and returns a 
   * new Chain from the concatenated results
   * @param f 
   */
  flatMap<B>(f: (a: A) => Chain<B>): Chain<B>
  /**
   * Folds over the elements from left to right using the supplied 
   * initial value and function.
   * @param z initial value
   * @param f 
   */
  foldLeft<B>(z: B, f: (b: B, a: A) => B): B
  /**
   * Folds over the elements from right to left using the supplied
   * initial value and function.
   * @param z 
   * @param f 
   */
  foldRight<B>(z: B, f: (a: A, b: B) => B): B
  /**
   * Check whether all elements satisfy the predicate
   * @param f 
   */
  forall(f: (a: A) => boolean): boolean
  get(idx: number): Option<A>
  /**
   * Groups elements inside this Chain according to the Order 
   * of the keys produced by the given mapping function.
   * @param f 
   */
  // groupBy<B>(f: (a: A) => B): SortedMap<B, NonEmptyChain<A>>
  /**
   * Groups elements inside this Chain according to the Order of the 
   * keys produced by the given key function.
   * @param key 
   * @param f 
   */
  // groupMap<K, B>(key: (a: A) => K, f: (a: A) => B): SortedMap<K, NonEmptyChain<B>>
  /**
   * Groups elements inside this Chain according to the Order of the keys 
   * produced by the given key function.
   * @param key 
   * @param f 
   */
  // groupMapReduce<K, B>(key: (a: A) => K, f: (a: A) => B): SortedMap<K, B>
  /**
   * Groups elements inside this Chain according to the Order of the keys produced by the given key function.
   * @param key 
   * @param f 
   * @param combine 
   */
  // groupMapReduceWith<K, B>(key: (a: A) => K, f: (a: A) => B, combine: (left: B, right: B) => B): SortedMap<K, B>
  headOption(): Option<A>
  /**
   * Returns the init and last of this Chain if non empty, none otherwise.
   */
  initLast(): Option<[Chain<A>, A]>
  /**
   * Returns true if there are no elements in this collection.
   */
  isEmpty(): boolean
  /**
   * Returns the last of this Chain if non empty, none otherwise.
   */
  lastOption(): Option<A>
  /**
   * Returns the number of elements in this structure
   */
  length(): number
  /**
   * Applies the supplied function to each element and returns a new Chain.
   * @param f 
   */
  map<B>(f: (a: A) => B): Chain<B>
  /**
   * Returns false if there are no elements in this collection.
   */
  nonEmpty(): boolean
  /**
   * Returns a new Chain consisting of a followed by this.
   * @param a 
   */
  prepend(a: A): Chain<A>
  /**
   * Reverses this Chain
   */
  reverse(): Chain<A>
  show(): string
  sortBy<B>(f: (a: A) => B): Chain<A>
  sorted(): Chain<A>
  /**
   * take a certain amount of items from the front of the Chain
   * @param count 
   */
  take(count: number): Chain<A>
  /**
   * take a certain amount of items from the back of the Chain
   * @param count 
   */
  takeRight(count: number): Chain<A>
  /**
   * Takes longest prefix of elements that satisfy a predicate.
   * @param p 
   */
  takeWhile(p: (a: A) => boolean): Chain<A>
  /**
   * Converst to an array
   */
  toArray(): A[]
  /**
   * Returns the head and tail of this Chain if non empty, 
   * none otherwise. Amortized O(1).
   */
  uncons(): Option<[A, Chain<A>]> // amortized O(1)
}

interface NonEmptyChainOps<A> {
  concatNE(c: Chain<A>): NonEmptyChain<A>
  last(): A
  initLastNE(): [Chain<A>, A]
  mapNE<B>(f: (a: A) => B): NonEmptyChain<B>
  unconsNE(): [A, Chain<A>]
}

type Empty<A> = typeof EmptyStruct & ChainOps<A>
type Singleton<A> = SingletonStruct<A> & ChainOps<A> & NonEmptyChainOps<A>
type Append<A> = AppendStruct<A> & ChainOps<A> & NonEmptyChainOps<A>
export type NonEmptyChain<A> = Singleton<A> | Append<A>
export type Chain<A> = Empty<A> | NonEmptyChain<A>

export function chain<A>(...as: A[]): Chain<A> {
  switch (as.length) {
    case 0:
      return empty()
    default:
      return singleton(as[0] as A).concat(chain(...as.slice(1)))
  }
}

export function chainNE<A>(a: A, ...as: A[]): NonEmptyChain<A> {
  return singleton(a).concatNE(chain(...as))
}

function empty<A>(): Empty<A> {
  return {
    type: 'empty',
    append: singleton,
    concat: c => c,
    contains: _ => false,
    deleteFirst: _ => none(),
    distinct: () => empty(),
    distinctBy: () => empty(),
    drop: _ => empty(),
    dropRight: _ => empty(),
    dropWhile: _ => empty(),
    exists: _ => false,
    filter: _ => empty(),
    filterNot: _ => empty(),
    find: _ => none(),
    flatMap: _ => empty(),
    foldLeft: (z, _) => z,
    foldRight: (z, _) => z,
    forall: _ => false,
    get: _ => none(),
    headOption: () => none(),
    initLast: () => none(),
    isEmpty: () => true,
    lastOption: () => none(),
    length: () => 0,
    map: _ => empty(),
    nonEmpty: () => false,
    prepend: a => singleton(a),
    reverse: () => empty(),
    show: () => "empty",
    sortBy: _ => empty(),
    sorted: () => empty(),
    take: _ => empty(),
    takeRight: _ => empty(),
    takeWhile: _ => empty(),
    toArray: () => [],
    uncons: () => none()
  }
}

function singleton<A>(a: A): Singleton<A> {
  function concatNE(c: Chain<A>): NonEmptyChain<A> {
    return c.type === 'empty'
      ? singleton(a)
      : append(singleton(a), c)
  }
  return {
    type: 'singleton',
    a,
    append: aLeft => append(singleton(a), singleton(aLeft)),
    concat: concatNE,
    concatNE,
    contains: match => a === match,
    deleteFirst: f => f(a) ? some([a, empty()]) : none(),
    distinct: () => singleton(a),
    distinctBy: () => singleton(a),
    drop: count => count === 0 ? singleton(a) : empty(),
    dropRight: count => count === 0 ? singleton(a) : empty(),
    dropWhile: f => f(a) ? empty() : singleton(a),
    exists: f => f(a),
    filter: f => f(a) ? singleton(a) : empty(),
    filterNot: f => f(a) ? empty() : singleton(a),
    find: f => f(a) ? some(a) : none(),
    flatMap: f => f(a),
    foldLeft: (z, f) => f(z, a),
    foldRight: (z, f) => f(a, z),
    forall: f => f(a),
    get: idx => idx === 0 ? some(a) : none(),
    headOption: () => some(a),
    initLast: () => some([empty(), a]),
    initLastNE: () => [empty(), a],
    isEmpty: () => false,
    last: () => a,
    lastOption: () => some(a),
    length: () => 1,
    map: f => singleton(f(a)),
    mapNE: f => singleton(f(a)),
    nonEmpty: () => true,
    prepend: aLeft => append(singleton(aLeft), singleton(a)),
    reverse: () => singleton(a),
    show: () => `singleton(${a})`,
    sortBy: _ => singleton(a),
    sorted: () => singleton(a),
    take: count => count === 0 ? empty() : singleton(a),
    takeRight: count => count === 0 ? empty() : singleton(a),
    takeWhile: p => p(a) ? singleton(a) : empty(),
    toArray: () => [a],
    uncons: () => some([a, empty()]),
    unconsNE: () => [a, empty()]
  }
}

function append<A>(leftNE: NonEmptyChain<A>, rightNE: NonEmptyChain<A>): Append<A> {
  function concatNE(c: Chain<A>): NonEmptyChain<A> {
    return c.type === 'empty'
      ? append(leftNE, rightNE)
      : append(append(leftNE, rightNE), c)
  }
  function distinctBy<B>(f: (a: A) => B) {
    return foldLeft([new Set(), chain()] as [Set<B>, Chain<A>], (b, a) => {
      const [set, chain] = b;
      const key = f(a)
      if (set.has(key))
        return b
      set.add(key)
      return [set, chain.append(a)] as [Set<B>, Chain<A>]
    })[1]
  }
  function foldLeft<B>(z: B, f: (b: B, a: A) => B): B {
    return rightNE.foldLeft(leftNE.foldLeft(z, f), f)
  }
  function initLastNE(): [Chain<A>, A] {
    const [rightInit, last] = rightNE.initLastNE()
    return [leftNE.concat(rightInit), last];
  }
  function mapNE<B>(f: (a: A) => B) {
    return append(leftNE.mapNE(f), rightNE.mapNE(f))
  }
  function takeWhileAppend(ne: NonEmptyChain<A>, p: (a: A) => boolean): [Chain<A>, boolean] {
    if (ne.type === 'singleton')
      return (p(ne.a)) ? [ne, true] : [empty(), false]
    const [left, isLeftAllTaken] = takeWhileAppend(ne.leftNE, p)
    if (isLeftAllTaken) {
      const [right, isRightAllTaken] = takeWhileAppend(ne.rightNE, p)
      return [left.concat(right), isRightAllTaken]
    }
    return [left, false]
  }
  function unconsNE(): [A, Chain<A>] {
    const [leftFirst, leftTail] = leftNE.unconsNE()
    return [leftFirst, leftTail.concat(rightNE)]
  }

  return {
    type: 'append',
    leftNE,
    rightNE,
    append: a => append(leftNE, append(rightNE, singleton(a))),
    concat: concatNE,
    concatNE,
    contains: a => leftNE.contains(a) || rightNE.contains(a),
    deleteFirst: f => leftNE.deleteFirst(f).fold(
      () => rightNE.deleteFirst(f).fold(
        () => none(),
        ([a, chain]) => some([a, leftNE.concat(chain)])
      ),
      ([a, chain]) => some([a, chain.concat(rightNE)])
    ),
    distinct: () => distinctBy(x => x),
    distinctBy,
    drop: count => count === 0
      ? append(leftNE, rightNE)
      : leftNE.drop(1).concat(rightNE).drop(count - 1),
    dropRight: count => count === 0
      ? append(leftNE, rightNE)
      : leftNE.concat(rightNE.dropRight(1)).dropRight(count - 1),
    dropWhile: p => {
      const left = leftNE.dropWhile(p)
      return left.type === 'empty'
        ? rightNE.dropWhile(p)
        : left.concat(rightNE)
    },
    exists: f => leftNE.exists(f) || rightNE.exists(f),
    filter: f => leftNE.filter(f).concat(rightNE.filter(f)),
    filterNot: f => leftNE.filterNot(f).concat(rightNE.filterNot(f)),
    find: f => leftNE.find(f).orElse(() => rightNE.find(f)),
    flatMap: f => leftNE.flatMap(f).concat(rightNE.flatMap(f)),
    foldLeft,
    foldRight: (z, f) => leftNE.foldRight(rightNE.foldRight(z, f), f),
    forall: f => leftNE.forall(f) && rightNE.forall(f),
    get: idx => idx === 0
      ? leftNE.get(0)
      : leftNE.drop(1).concat(rightNE).get(idx - 1),
    headOption: () => leftNE.get(0),
    initLast: () => some(initLastNE()),
    initLastNE,
    isEmpty: () => false,
    last: () => rightNE.last(),
    lastOption: () => rightNE.lastOption(),
    length: () => leftNE.length() + rightNE.length(),
    map: mapNE,
    mapNE,
    nonEmpty: () => true,
    prepend: a => leftNE.prepend(a).concat(rightNE),
    reverse: () => rightNE.reverse().concat(leftNE.reverse()),
    show: () => `append(${leftNE.show()}, ${rightNE.show()})`,
    sortBy: () => { throw new NotImplementError() },
    sorted: () => { throw new NotImplementError() },
    take: count => {
      if (count === 0)
        return empty()
      const [leftFirst, leftTail] = leftNE.unconsNE();
      return singleton(leftFirst).concat(leftTail.concat(rightNE).take(count - 1))
    },
    takeRight: count => {
      if (count === 0)
        return empty()
      const [rightInit, rightLast] = rightNE.initLastNE();
      return leftNE.concat(rightInit).takeRight(count - 1).concat(singleton(rightLast))
    },
    takeWhile: p => takeWhileAppend(append(leftNE, rightNE), p)[0],
    toArray: () => [...leftNE.toArray(), ...rightNE.toArray()],
    uncons: () => some(unconsNE()),
    unconsNE
  }
}
