import { describe, it, expect } from 'vitest'
import { type Option, option, some, none, flattenOption } from './option.js'

describe('Option', () => {
  describe('option', () => {
    it('should create Some for non-null/undefined values', () => {
      const opt = option(5)
      expect(opt.isDefined()).toBe(true)
    })

    it('should create None for null', () => {
      const opt = option(null)
      expect(opt.isEmpty()).toBe(true)
    })

    it('should create None for undefined', () => {
      const opt = option(undefined)
      expect(opt.isEmpty()).toBe(true)
    })
  })

  describe('some', () => {
    describe('contain', () => {
      it('should return true when match', () => {
        expect(some(42).contains(42)).toBe(true)
      })
      
      it('should return false when no match', () => {
        expect(some(42).contains(0)).toBe(false)
      })
    })

    it('map', () => {
      expect(some(5).map(x => x * 2).contains(10)).toBe(true)
    })

    it('flatMap', () => {
      expect(some(5).flatMap(x => some(x * 2)).contains(10)).toBe(true)
    })

    it('fold', () => {
      expect(some(5).fold(() => 0, x => x * 2)).toBe(10)
    })

    describe('filter', () => {
      it('should Some true when match', () => {
        expect(some(5).filter(x => x > 3).isDefined()).toBe(true)
      })

      it('should None fasle when no match', () => {
        expect(some(5).filter(x => x > 10).isEmpty()).toBe(true)
      })
    })

    describe('exist', () => {
      it('should return true when match', () => {
        expect(some(5).exists(x => x > 3)).toBe(true)
      })

      it('should return false when no match', () => {
        expect(some(5).exists(x => x > 10)).toBe(false)
      })
    })

    describe('forall', () => {
      it('should return true when match', () => {
        expect(some(5).forall(x => x > 0)).toBe(true)
      })

      it('should return false when no match', () => {
        expect(some(5).forall(x => x > 10)).toBe(false)
      })
    })

    it('foreach', () => {
      let called = false
      some(5).foreach(() => { called = true })
      expect(called).toBe(true)
    })

    it('getOrElse', () => {
      expect(some(5).getOrElse(() => 0)).toBe(5)
    })

    it('orElse', () => {
      expect(some(5).orElse(() => some(10)).contains(5)).toBe(true)
    })

    describe('filterNot', () => {
      it('should return Some when no match', () => {
        expect(some(5).filterNot(x => x > 10).isDefined()).toBe(true)
      })

      it('should return None when no match', () => {
        expect(some(5).filterNot(x => x > 3).isEmpty()).toBe(true)
      })
    })

    it('get', () => {
      expect(some(42).get()).toBe(42)
    })

    it('nonEmpty', () => {
      expect(some(5).nonEmpty()).toBe(true)
    })

    it('orNull', () => {
      expect(some(42).orNull()).toBe(42)
    })

    it('toLeft', () => {
      expect(some(5).toLeft(() => 'error').left().exists(value => value === 5)).toBe(true)
    })

    it('toRight', () => {
      expect(some(5).toRight(() => 'error').contains(5)).toBe(true)
    })

    describe('zip', () => {
      it('should return Some with Some', () => {
        const actual = some(5).zip(some('hello'))

        expect(actual.isDefined()).toBe(true)
        actual.foreach(value => expect(value).toEqual([5, 'hello']))
      })

      it('should return None with None', () => {
        expect(some(5).zip(none()).isEmpty()).toBe(true)
      })
    })
  })

  describe('none', () => {
    it('contains', () => {
      expect(none().contains(42)).toBe(false)
    })

    it('map', () => {
      expect(none<number>().map(x => x * 2).isEmpty()).toBe(true)
    })

    it('flatMap', () => {
      expect(none<number>().flatMap(x => some(x * 2)).isEmpty()).toBe(true)
    })

    it('fold', () => {
      expect(none<number>().fold(() => 0, x => x * 2)).toBe(0)
    })

    it('filter', () => {
      expect(none<number>().filter(_ => true).isEmpty()).toBe(true)
    })

    it('exist', () => {
      expect(none<number>().exists(_ => true)).toBe(false)
    })

    it('forall', () => {
      expect(none<number>().forall(_ => true)).toBe(false)
    })

    it('foreach', () => {
      let called = false
      none().foreach(() => { called = true })
      expect(called).toBe(false)
    })

    it('getOrElse', () => {
      expect(none().getOrElse(() => 42)).toBe(42)
    })

    it('orElse', () => {
      expect(none().orElse(() => some(10)).contains(10)).toBe(true)
    })

    it('filterNot', () => {
      expect(none<number>().filterNot(x => x > 3).isEmpty()).toBe(true)
    })

    it('get', () => {
      expect(() => none<number>().get()).toThrow()
    })

    it('nonEmpty', () => {
      expect(none<number>().nonEmpty()).toBe(false)
    })

    it('orNull', () => {
      expect(none<number>().orNull()).toBe(null)
    })

    it('toLeft', () => {
      expect(none().toLeft(() => 'error').contains('error'))
    })

    it('toRight', () => {
      expect(none().toRight(() => 'error').left().exists(value => value === 'error')).toBe(true)
    })

    describe('zip', () => {
      it('should return None with Some', () => {
        expect(none<number>().zip(some('hello')).isEmpty()).toBe(true)
      })

      it('should return None with None', () => {
        expect(none<number>().zip(none()).isEmpty()).toBe(true)
      })
    })
  })

  describe('flattenOption', () => {
    it('should flatten Some of Some to value', () => {
      expect(flattenOption(some(some(42))).contains(42)).toBe(true)
    })

    it('should flatten Some of None to None', () => {
      expect(flattenOption(some(none())).isEmpty()).toBe(true)
    })

    it('should flatten None to None', () => {
      expect(flattenOption(none<Option<number>>()).isEmpty()).toBe(true)
    })
  })
})