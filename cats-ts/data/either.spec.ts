import { describe, it, expect } from 'vitest'
import { type Either, left, right, flattenEither, joinLeft, joinRight } from './either.js'

describe('Either', () => {
  describe('left', () => {
    it('isLeft should return true', () => {
      expect(left('error').isLeft()).toBe(true)
    })

    it('isRight should return false', () => {
      expect(left('error').isRight()).toBe(false)
    })

    it('contains should return false', () => {
      expect(left('error').contains(42)).toBe(false)
    })

    it('exists should return false', () => {
      expect(left<string, number>('error').exists(x => x > 0)).toBe(false)
    })

    it('filterOrElse should return Left with existing value', () => {
      const actual = left<string, number>('error').filterOrElse(x => x > 0, () => 'default')
      
      expect(actual.isLeft()).toBe(true)
      actual.left().foreach(value => expect(value).toBe('error'))
    })

    it('flatMap should return Left with existing value', () => {
      const actual = left<string, number>('error').flatMap(x => right(x * 2))
      
      expect(actual.isLeft()).toBe(true)
      actual.left().foreach(value => expect(value).toBe('error'))
    })

    it('forall should return false', () => {
      expect(left<string, number>('error').forall(x => x > 0)).toBe(false)
    })

    it('foreach should not execute function', () => {
      let called = false
      left('error').foreach(() => { called = true })
      expect(called).toBe(false)
    })

    it('getOrElse should return default value', () => {
      expect(left<string, number>('error').getOrElse(() => 42)).toBe(42)
    })

    it('map should return Left with existing value', () => {
      const actual = left<string, number>('error').map(x => x * 2)

      expect(actual.isLeft()).toBe(true)
      actual.left().foreach(value => expect(value).toBe('error'))
    })

    it('orElse should return alternative Either', () => {
      const actual = left<string, number>('error').orElse(() => right(42))

      expect(actual.isRight()).toBe(true)
      actual.left().foreach(value => expect(value).toBe('error'))
    })

    it('swap should swap Left to Right', () => {
      const actual = left<string, number>('error').swap()

      expect(actual.isRight()).toBe(true)
      expect(actual.contains('error')).toBe(true)
    })

    it('toOption should return None', () => {
      expect(left('error').toOption().isEmpty()).toBe(true)
    })

    it('fold should apply left function', () => {
      expect(left<string, number>('error').fold(s => s.length, n => n)).toBe(5)
    })

    describe('left projection', () => {
      describe('exists', () => {
        it('should return true when predicate matches', () => {
          expect(left<string, number>('error').left().exists(s => s.length > 0)).toBe(true)
        })

        it('should return false when predicate does not match', () => {
          expect(left<string, number>('error').left().exists(s => s.length > 10)).toBe(false)
        })
      })

      describe('filterToOption', () => {
        it('should return Some with Left when predicate matches', () => {
          const result = left<string, number>('error').left().filterToOption(s => s.length > 0)
          expect(result.isDefined()).toBe(true)
          result.foreach(e => expect(e.left().exists(s => s === 'error')).toBe(true))
        })

        it('should return None when predicate does not match', () => {
          const result = left<string, number>('error').left().filterToOption(s => s.length > 10)
          expect(result.isEmpty()).toBe(true)
        })
      })

      describe('flatMap', () => {
        it('should apply function to Left value', () => {
          const result = left<string, number>('error').left().flatMap(s => left(s.length))
          expect(result.left().exists(n => n === 5)).toBe(true)
        })
      })

      describe('forall', () => {
        it('should return true when predicate matches', () => {
          expect(left<string, number>('error').left().forall(s => s.length > 0)).toBe(true)
        })

        it('should return false when predicate does not match', () => {
          expect(left<string, number>('error').left().forall(s => s.length > 10)).toBe(false)
        })
      })

      describe('foreach', () => {
        it('should execute function', () => {
          let called = false
          left<string, number>('error').left().foreach(() => { called = true })
          expect(called).toBe(true)
        })
      })

      describe('getOrElse', () => {
        it('should return Left value', () => {
          expect(left<string, number>('error').left().getOrElse(() => 'default')).toBe('error')
        })
      })

      describe('map', () => {
        it('should transform Left value', () => {
          const result = left<string, number>('error').left().map(s => s.length)
          expect(result.left().exists(n => n === 5)).toBe(true)
        })
      })

      describe('toOption', () => {
        it('should return Some with Left value', () => {
          const result = left<string, number>('error').left().toOption()
          expect(result.contains('error')).toBe(true)
        })
      })
    })
  })

  describe('right', () => {
    it('isLeft should return false', () => {
      expect(right(42).isLeft()).toBe(false)
    })

    it('isRight should return true', () => {
      expect(right(42).isRight()).toBe(true)
    })

    describe('contains', () => {
      it('should return true when match', () => {
        expect(right(42).contains(42)).toBe(true)
      })

      it('should return false when no match', () => {
        expect(right(42).contains(0)).toBe(false)
      })
    })

    describe('exists', () => {
      it('should return true when predicate matches', () => {
        expect(right(42).exists(x => x > 0)).toBe(true)
      })

      it('should return false when predicate does not match', () => {
        expect(right(42).exists(x => x > 100)).toBe(false)
      })
    })

    describe('filterOrElse', () => {
      it('should return Right when predicate matches', () => {
        const actual = right(42).filterOrElse(x => x > 0, () => 'error')

        expect(actual.isRight()).toBe(true)
        expect(actual.contains(42)).toBe(true)
      })

      it('should return Left when predicate does not match', () => {
        const actual = right(42).filterOrElse(x => x > 100, () => 'error')

        expect(actual.isLeft()).toBe(true)
        actual.left().foreach(value => expect(value).toBe('error'))
      })
    })

    describe('flatMap', () => {
      it('should apply function to Right value', () => {
        expect(right(5).flatMap(x => right(x * 2)).contains(10)).toBe(true)
      })

      it('should propagate Left from function', () => {
        expect(right(5).flatMap(x => left('error')).isLeft()).toBe(true)
      })
    })

    describe('forall', () => {
      it('should return true when predicate matches', () => {
        expect(right(42).forall(x => x > 0)).toBe(true)
      })

      it('should return false when predicate does not match', () => {
        expect(right(42).forall(x => x > 100)).toBe(false)
      })
    })

    it('foreach should execute function', () => {
      let called = false

      right(42).foreach(() => { called = true })
      
      expect(called).toBe(true)
    })

    it('getOrElse should return Right value', () => {
      expect(right(42).getOrElse(() => 0)).toBe(42)
    })

    it('map should transform Right value', () => {
      expect(right(5).map(x => x * 2).contains(10)).toBe(true)
    })

    it('orElse should return original Right', () => {
      expect(right(42).orElse(() => right(0)).contains(42)).toBe(true)
    })

    it('swap should swap Right to Left', () => {
      const result = right<string, number>(42).swap()
      expect(result.isLeft()).toBe(true)
      expect(result.left().exists(n => n === 42)).toBe(true)
    })

    it('toOption should return Some with Right value', () => {
      expect(right(42).toOption().contains(42)).toBe(true)
    })

    it('fold should apply right function', () => {
      expect(right<string, number>(42).fold(s => s.length, n => n * 2)).toBe(84)
    })

    describe('left projection', () => {
      it('exists should return false', () => {
        expect(right<string, number>(42).left().exists(s => s.length > 0)).toBe(false)
      })

      it('filterToOption should return None', () => {
        expect(right<string, number>(42).left().filterToOption(s => s.length > 0).isEmpty()).toBe(true)
      })

      it('flatMap should return Right unchanged', () => {
        expect(right<string, number>(42).left().flatMap(s => left(s.length)).contains(42)).toBe(true)
      })

      it('forall should return false', () => {
        expect(right<string, number>(42).left().forall(s => s.length > 0)).toBe(false)
      })

      it('foreach should not execute function', () => {
        let called = false

        right(42).left().foreach(() => { called = true })

        expect(called).toBe(false)
      })

      it('getOrElse should return default value', () => {
        expect(right(42).left().getOrElse(() => 'default')).toBe('default')
      })

      it('map should return Right unchanged', () => {
        expect(right<string, number>(42).left().map(s => s.length).contains(42)).toBe(true)
      })

      it('toOption should return None', () => {
        expect(right(42).left().toOption().isEmpty()).toBe(true)
      })
    })
  })

  describe('flattenEither', () => {
    it('should flatten Right of Right to value', () => {
      expect(flattenEither(right<string, Either<string, number>>(right(42))).contains(42)).toBe(true)
    })

    it('should flatten Right of Left to Left', () => {
      const actual = flattenEither(right<string, Either<string, number>>(left('error')))

      expect(actual.isLeft()).toBe(true)
      actual.left().foreach(value => expect(value).toBe('error'))
    })

    it('should flatten Left to Left', () => {
      const actual = flattenEither(left<string, Either<string, number>>('error'))

      expect(actual.isLeft()).toBe(true)
      actual.left().foreach(value => expect(value).toBe('error'))
    })
  })

  describe('joinLeft', () => {
    it('should join Left of Left to Left value', () => {
      const actual = joinLeft(left<Either<string, number>, number>(left('error')))

      expect(actual.isLeft()).toBe(true)
      actual.left().foreach(value => expect(value).toBe('error'))
    })

    it('should join Left of Right to Right', () => {
      expect(joinLeft(left<Either<string, number>, number>(right(42))).contains(42)).toBe(true)
    })

    it('should keep Right as Right', () => {
      expect(joinLeft(right<Either<string, number>, number>(42)).contains(42)).toBe(true)
    })
  })

  describe('joinRight', () => {
    it('should join Right of Right to Right value', () => {
      expect(joinRight(right(right(42))).contains(42)).toBe(true)
    })

    it('should join Right of Left to Left', () => {
      const actual = joinRight(right(left('error')))

      expect(actual.isLeft()).toBe(true)
      actual.left().foreach(value => expect(value).toBe('error'))
    })

    it('should keep Left as Left', () => {
      const actual = joinRight(left<string, Either<string, number>>('error'))

      expect(actual.isLeft()).toBe(true)
      actual.left().foreach(value => expect(value).toBe('error'))
    })
  })
})