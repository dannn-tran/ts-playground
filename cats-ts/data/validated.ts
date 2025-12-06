import { chainNE, type NonEmptyChain } from './chain.js'

export type Valid<A> = {
  type: 'valid'
  a: A
}

export type Invalid<E> = {
  type: 'invalid'
  e: E
}

export type Validated<E, A> = Valid<A> | Invalid<E>
export type ValidatedNec<E, A> = Validated<NonEmptyChain<E>, A>

export function validNec<E, A>(a: A): ValidatedNec<E, A> {
  return {
    type: 'valid',
    a
  }
}

export function invalidNec<E, A>(e: E, ...es: E[]): ValidatedNec<E, A> {
  return {
    type: 'invalid',
    e: chainNE(e, ...es)
  }
}

const validatedNecApplicative = {
  map2<E, A1, A2>(x1: ValidatedNec<E, A1>, x2: ValidatedNec<E, A2>): ValidatedNec<E, [A1, A2]> {
    if (x1.type === 'valid')
      if (x2.type === 'valid')
        return validNec([x1.a, x2.a])
      else
        return {
          type: 'invalid',
          e: x2.e
        }
    else if (x2.type === 'valid')
      return {
        type: 'invalid',
        e: x1.e
      }
    else
      return {
        type: 'invalid',
        e: x1.e.concatNE(x2.e)
      }
  }
}