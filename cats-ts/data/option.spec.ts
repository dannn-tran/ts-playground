import { describe, it, expect } from 'vitest'
import { option, some, none } from './option.js'

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
    it('should contain the value', () => {
      const s = some(42)
      expect(s.contains(42)).toBe(true)
      expect(s.contains(0)).toBe(false)
    })

    it('should map over value', () => {
      const result = some(5).map(x => x * 2)
      expect(result.contains(10)).toBe(true)
    })

    it('should flatMap correctly', () => {
      const result = some(5).flatMap(x => some(x * 2))
      expect(result.contains(10)).toBe(true)
    })

    it('should fold with function', () => {
      const result = some(5).fold(() => 0, x => x * 2)
      expect(result).toBe(10)
    })

    it('should filter matching predicate', () => {
      const result = some(5).filter(x => x > 3)
      expect(result.isDefined()).toBe(true)
    })

    it('should filter non-matching predicate', () => {
      const result = some(5).filter(x => x > 10)
      expect(result.isEmpty()).toBe(true)
    })

    it('should exist with matching predicate', () => {
      expect(some(5).exists(x => x > 3)).toBe(true)
      expect(some(5).exists(x => x > 10)).toBe(false)
    })

    it('should forall with matching predicate', () => {
      expect(some(5).forall(x => x > 0)).toBe(true)
      expect(some(5).forall(x => x > 10)).toBe(false)
    })

    it('should foreach execute function', () => {
      let called = false
      some(5).foreach(() => { called = true })
      expect(called).toBe(true)
    })

    it('should getOrElse return value', () => {
      expect(some(5).getOrElse(() => 0)).toBe(5)
    })

    it('should orElse return self', () => {
      const result = some(5).orElse(() => some(10))
      expect(result.contains(5)).toBe(true)
    })
  })

  describe('none', () => {
    it('should not contain any value', () => {
      expect(none().contains(42)).toBe(false)
    })

    it('should map to None', () => {
      const result = none<number>().map(x => x * 2)
      expect(result.isEmpty()).toBe(true)
    })

    it('should flatMap to None', () => {
      const result = none<number>().flatMap(x => some(x * 2))
      expect(result.isEmpty()).toBe(true)
    })

    it('should fold with ifEmpty', () => {
      const result = none<number>().fold(() => 0, x => x * 2)
      expect(result).toBe(0)
    })

    it('should filter to None', () => {
      const result = none<number>().filter(x => x > 3)
      expect(result.isEmpty()).toBe(true)
    })

    it('should not exist', () => {
      expect(none<number>().exists(x => x > 3)).toBe(false)
    })

    it('should forall return true', () => {
      expect(none<number>().forall(x => x > 0)).toBe(false)
    })

    it('should getOrElse return default', () => {
      expect(none<number>().getOrElse(() => 42)).toBe(42)
    })

    it('should orElse return alternative', () => {
      const result = none<number>().orElse(() => some(10))
      expect(result.contains(10)).toBe(true)
    })
  })
})