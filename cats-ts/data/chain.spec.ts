import { describe, it, expect } from 'vitest'
import { chain } from './chain.js'

describe('Chain', () => {
  describe('creation', () => {
    it('should create an empty chain from no arguments', () => {
      const c = chain()
      expect(c.isEmpty()).toBe(true)
      expect(c.length()).toBe(0)
    })

    it('should create a singleton chain from one argument', () => {
      const c = chain(1)
      expect(c.isEmpty()).toBe(false)
      expect(c.length()).toBe(1)
      expect(c.headOption().isDefined()).toBe(true)
    })

    it('should create a chain from multiple arguments', () => {
      const c = chain(1, 2, 3)
      expect(c.length(), c.show()).toBe(3)
      expect(c.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('append', () => {
    it('should append an element to a chain', () => {
      const c = chain(1, 2).append(3)
      expect(c.toArray()).toEqual([1, 2, 3])
    })

    it('should append to empty chain', () => {
      const c = chain().append(1)
      expect(c.toArray()).toEqual([1])
    })
  })

  describe('concat', () => {
    it('should concatenate two chains', () => {
      const c1 = chain(1, 2)
      const c2 = chain(3, 4)
      expect(c1.concat(c2).toArray()).toEqual([1, 2, 3, 4])
    })

    it('should concatenate with empty chain', () => {
      expect(chain(1, 2).concat(chain()).toArray()).toEqual([1, 2])
      expect(chain().concat(chain(1, 2)).toArray()).toEqual([1, 2])
    })
  })

  describe('prepend', () => {
    it('should prepend an element to a chain', () => {
      const c = chain(2, 3).prepend(1)
      expect(c.toArray()).toEqual([1, 2, 3])
    })

    it('should prepend to empty chain', () => {
      const c = chain().prepend(1)
      expect(c.toArray()).toEqual([1])
    })
  })

  describe('contains', () => {
    it('should return true if element is in chain', () => {
      expect(chain(1, 2, 3).contains(2)).toBe(true)
    })

    it('should return false if element is not in chain', () => {
      expect(chain(1, 2, 3).contains(4)).toBe(false)
    })

    it('should return false for empty chain', () => {
      expect(chain().contains(1)).toBe(false)
    })
  })

  describe('map', () => {
    it('should apply function to all elements', () => {
      const result = chain(1, 2, 3).map(x => x * 2)
      expect(result.toArray()).toEqual([2, 4, 6])
    })

    it('should map empty chain', () => {
      const result = chain<number>().map(x => x * 2)
      expect(result.isEmpty()).toBe(true)
    })
  })

  describe('flatMap', () => {
    it('should apply function and flatten results', () => {
      const result = chain(1, 2).flatMap(x => chain(x, x))
      expect(result.toArray()).toEqual([1, 1, 2, 2])
    })

    it('should flatMap empty chain', () => {
      const result = chain().flatMap(x => chain(x))
      expect(result.isEmpty()).toBe(true)
    })
  })

  describe('filter', () => {
    it('should keep elements matching predicate', () => {
      const result = chain(1, 2, 3, 4).filter(x => x % 2 === 0)
      expect(result.toArray()).toEqual([2, 4])
    })

    it('should filter empty chain', () => {
      const result = chain<number>().filter(x => x > 0)
      expect(result.isEmpty()).toBe(true)
    })
  })

  describe('filterNot', () => {
    it('should remove elements matching predicate', () => {
      const result = chain(1, 2, 3, 4).filterNot(x => x % 2 === 0)
      expect(result.toArray()).toEqual([1, 3])
    })
  })

  describe('find', () => {
    it('should find first element matching predicate', () => {
      expect(chain(1, 2, 3).find(x => x > 1).get()).toBe(2)
    })

    it('should return none if no element matches', () => {
      expect(chain(1, 2, 3).find(x => x > 10).isDefined()).toBe(false)
    })
  })

  describe('foldLeft', () => {
    it('should fold from left to right', () => {
      const result = chain(1, 2, 3).foldLeft(0, (acc, x) => acc + x)
      expect(result).toBe(6)
    })

    it('should fold with initial value', () => {
      const result = chain(1, 2, 3).foldLeft(10, (acc, x) => acc + x)
      expect(result).toBe(16)
    })
  })

  describe('foldRight', () => {
    it('should fold from right to left', () => {
      const result = chain(1, 2, 3).foldRight(0, (x, acc) => acc + x)
      expect(result).toBe(6)
    })
  })

  describe('forall', () => {
    it('should return true if all elements match predicate', () => {
      expect(chain(2, 4, 6).forall(x => x % 2 === 0)).toBe(true)
    })

    it('should return false if any element does not match', () => {
      expect(chain(2, 3, 4).forall(x => x % 2 === 0)).toBe(false)
    })

    it('should return false for empty chain', () => {
      expect(chain().forall(_ => false)).toBe(false)
    })
  })

  describe('exists', () => {
    it('should return true if any element matches predicate', () => {
      expect(chain(1, 3, 5).exists(x => x % 2 === 0)).toBe(false)
      expect(chain(1, 2, 3).exists(x => x % 2 === 0)).toBe(true)
    })

    it('should return false for empty chain', () => {
      expect(chain().exists(_ => true)).toBe(false)
    })
  })

  describe('get', () => {
    it('should get element at index', () => {
      const c = chain(10, 20, 30)
      expect(c.get(0).get()).toBe(10)
      expect(c.get(1).get()).toBe(20)
      expect(c.get(2).get()).toBe(30)
    })

    it('should return none for out of bounds index', () => {
      expect(chain(1, 2).get(5).isDefined()).toBe(false)
    })
  })

  describe('headOption', () => {
    it('should return first element', () => {
      expect(chain(1, 2, 3).headOption().get()).toBe(1)
    })

    it('should return none for empty chain', () => {
      expect(chain().headOption().isDefined()).toBe(false)
    })
  })

  describe('lastOption', () => {
    it('should return last element', () => {
      expect(chain(1, 2, 3).lastOption().get()).toBe(3)
    })

    it('should return none for empty chain', () => {
      expect(chain().lastOption().isDefined()).toBe(false)
    })
  })

  describe('uncons', () => {
    it('should return head and tail', () => {
      const [head, tail] = chain(1, 2, 3).uncons().get()

      expect(head).toBe(1)
      expect(tail.toArray()).toEqual([2, 3])
    })

    it('should return none for empty chain', () => {
      expect(chain().uncons().isDefined()).toBe(false)
    })
  })

  describe('take', () => {
    it('should take n elements from front', () => {
      expect(chain(1, 2, 3, 4).take(2).toArray()).toEqual([1, 2])
    })

    it('should take zero elements', () => {
      expect(chain(1, 2, 3).take(0).isEmpty()).toBe(true)
    })

    it('should take more than available', () => {
      expect(chain(1, 2).take(5).toArray()).toEqual([1, 2])
    })
  })

  describe('takeRight', () => {
    it('should take n elements from back', () => {
      expect(chain(1, 2, 3, 4).takeRight(2).toArray()).toEqual([3, 4])
    })

    it('should take zero elements', () => {
      expect(chain(1, 2, 3).takeRight(0).isEmpty()).toBe(true)
    })
  })

  describe('takeWhile', () => {
    it('should take elements while predicate holds', () => {
      expect(chain(1, 2, 3, 4, 5).takeWhile(x => x < 4).toArray()).toEqual([1, 2, 3])
    })

    it('should return empty if first element fails predicate', () => {
      expect(chain(1, 2, 3).takeWhile(x => x > 5).isEmpty()).toBe(true)
    })
  })

  describe('drop', () => {
    it('should drop n elements from front', () => {
      expect(chain(1, 2, 3, 4).drop(2).toArray()).toEqual([3, 4])
    })

    it('should drop zero elements', () => {
      expect(chain(1, 2, 3).drop(0).toArray()).toEqual([1, 2, 3])
    })

    it('should drop all elements', () => {
      expect(chain(1, 2).drop(5).isEmpty()).toBe(true)
    })
  })

  describe('dropRight', () => {
    it('should drop n elements from back', () => {
      expect(chain(1, 2, 3, 4).dropRight(2).toArray()).toEqual([1, 2])
    })

    it('should drop zero elements', () => {
      expect(chain(1, 2, 3).dropRight(0).toArray()).toEqual([1, 2, 3])
    })
  })

  describe('dropWhile', () => {
    it('should drop elements while predicate holds', () => {
      expect(chain(1, 2, 3, 4, 5).dropWhile(x => x < 4).toArray()).toEqual([4, 5])
    })

    it('should not drop if first element fails predicate', () => {
      expect(chain(1, 2, 3).dropWhile(x => x > 5).toArray()).toEqual([1, 2, 3])
    })
  })

  describe('reverse', () => {
    it('should reverse the chain', () => {
      expect(chain(1, 2, 3).reverse().toArray()).toEqual([3, 2, 1])
    })

    it('should reverse empty chain', () => {
      expect(chain().reverse().isEmpty()).toBe(true)
    })
  })

  describe('length', () => {
    it('should return the number of elements', () => {
      expect(chain(1, 2, 3).length()).toBe(3)
      expect(chain().length()).toBe(0)
    })
  })

  describe('isEmpty and nonEmpty', () => {
    it('should correctly identify empty chains', () => {
      expect(chain().isEmpty()).toBe(true)
      expect(chain().nonEmpty()).toBe(false)
    })

    it('should correctly identify non-empty chains', () => {
      expect(chain(1).isEmpty()).toBe(false)
      expect(chain(1).nonEmpty()).toBe(true)
    })
  })

  describe('toArray', () => {
    it('should convert chain to array', () => {
      expect(chain(1, 2, 3).toArray()).toEqual([1, 2, 3])
    })

    it('should convert empty chain to empty array', () => {
      expect(chain().toArray()).toEqual([])
    })
  })

  describe('deleteFirst', () => {
    it('should delete first element matching predicate', () => {
      const [head, tail] = chain(1, 2, 3, 2).deleteFirst(x => x === 2).get()

      expect(head).toBe(2)
      expect(tail.toArray()).toEqual([1, 3, 2])
    })

    it('should return none if no element matches', () => {
      expect(chain(1, 2, 3).deleteFirst(x => x > 10).isDefined()).toBe(false)
    })
  })

  describe('distinct', () => {
    it('should remove duplicate elements', () => {
      expect(chain(1, 2, 2, 3, 1).distinct().toArray()).toEqual([1, 2, 3])
    })

    it('should handle empty chain', () => {
      expect(chain().distinct().isEmpty()).toBe(true)
    })
  })

  describe('distinctBy', () => {
    it('should remove duplicates by predicate', () => {
      const result = chain(1, 2, 3, 4).distinctBy(x => x % 2)
      expect(result.length()).toBe(2)
    })
  })

  describe('initLast', () => {
    it('should return init and last element', () => {
      const [init, last] = chain(1, 2, 3).initLast().get()

      expect(init.toArray()).toEqual([1, 2])
      expect(last).toBe(3)
    })

    it('should return none for empty chain', () => {
      expect(chain().initLast().isDefined()).toBe(false)
    })
  })
})