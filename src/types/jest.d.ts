declare namespace jest {
  interface Matchers<R> {
    toBeChecked(): R;
    toHaveValue(value: string | number): R;
    toBeLessThan(value: number): R;
    toBeGreaterThan(value: number): R;
    toBeLessThanOrEqual(value: number): R;
    toBeGreaterThanOrEqual(value: number): R;
    not: Matchers<R>;
  }
}

declare function describe(name: string, fn: () => void): void;
declare function it(name: string, fn: () => void): void;
declare function test(name: string, fn: () => void): void;
declare function expect(value: any): jest.Matchers<any>;
declare function beforeEach(fn: () => void): void;
declare function afterEach(fn: () => void): void;
declare function beforeAll(fn: () => void): void;
declare function afterAll(fn: () => void): void;
