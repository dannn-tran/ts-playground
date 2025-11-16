import { describe, it, expect, vi } from "vitest";
import { Var } from "./signal";

describe("signal - createVar / derived signals", () => {
  it("get returns the initial value", () => {
    const v = new Var(42);
    expect(v.get()).toBe(42);
  });

  it("set updates value and derived signals reflect the new value", () => {
    const v = new Var(2);
    const doubled = v.map((x) => x * 2);
    expect(doubled.get()).toBe(4);

    v.set(3);
    expect(doubled.get()).toBe(6);
  });

  it("update modifies the value based on the current value", () => {
    const v = new Var(10);
    v.update((x) => x + 5);
    expect(v.get()).toBe(15);

    v.update((x) => x * 2);
    expect(v.get()).toBe(30);
  });

  it("combineWith combines two signals", () => {
    const a = new Var(1);
    const b = new Var(2);
    const combined = a.combineWith(b);
    expect(combined.get()).toEqual([1, 2]);

    a.set(3);
    expect(combined.get()).toEqual([3, 2]);

    b.set(4);
    expect(combined.get()).toEqual([3, 4]);
  });

  it("combineWithFn combines two signals with a custom function", () => {
    const a = new Var(1);
    const b = new Var(2);
    const summed = a.combineWithFn(b, (x, y) => x + y);
    expect(summed.get()).toBe(3);

    a.set(5);
    expect(summed.get()).toBe(7);

    b.set(10);
    expect(summed.get()).toBe(15);
  });

  it("subscribe calls the callback on value changes", () => {
    const v = new Var(100);
    const observer = vi.fn();
    const subscription = v.addObserver(observer);

    expect(observer).toHaveBeenCalledWith(100);

    v.set(200);
    expect(observer).toHaveBeenCalledWith(200);

    v.set(300);
    expect(observer).toHaveBeenCalledWith(300);

    expect(observer).toHaveBeenCalledTimes(3);

    subscription.kill();
    v.set(400);
    expect(observer).toHaveBeenCalledTimes(3);
  });

  it("multiple observers are supported", () => {
    const v = new Var("initial");
    const signal = v.map((x) => x.toUpperCase());

    const observer1 = vi.fn();
    const observer2 = vi.fn();
    const sub1 = signal.addObserver(observer1);
    const sub2 = signal.addObserver(observer2);

    expect(observer1).toHaveBeenCalledWith("INITIAL");
    expect(observer2).toHaveBeenCalledWith("INITIAL");

    v.set("changed");
    expect(observer1).toHaveBeenCalledWith("CHANGED");
    expect(observer2).toHaveBeenCalledWith("CHANGED");

    expect(observer1).toHaveBeenCalledTimes(2);
    expect(observer2).toHaveBeenCalledTimes(2);

    sub1.kill();
    v.set("final");
    expect(observer1).toHaveBeenCalledTimes(2);
    expect(observer2).toHaveBeenCalledWith("FINAL");
    expect(observer2).toHaveBeenCalledTimes(3);

    sub2.kill();
    v.set("no observers");
    expect(observer1).toHaveBeenCalledTimes(2);
    expect(observer2).toHaveBeenCalledTimes(3);
  });
});