import { bytesCompare, bytesDecrement, bytesIncrement, numberToBytes } from '~/flatbuffers/utils/bytes';
import { HubError } from '~/utils/hubErrors';

describe('bytesCompare', () => {
  const cases: [Uint8Array, Uint8Array, number][] = [
    [new Uint8Array([1]), new Uint8Array([2]), -1],
    [new Uint8Array([255, 1]), new Uint8Array([255, 2]), -1],
    [new Uint8Array([1, 1]), new Uint8Array([2]), -1],
    [new Uint8Array([0, 1]), new Uint8Array([2]), -1],
    [new Uint8Array(), new Uint8Array([1]), -1],
    [new Uint8Array(), new Uint8Array(), 0],
    [new Uint8Array([0, 0, 0, 1, 0]), new Uint8Array([0, 0, 0, 0, 1]), 1],
    [new Uint8Array([1, 0, 0, 1, 0]), new Uint8Array([1, 0, 0, 2, 0]), -1],
  ];
  for (const [a, b, result] of cases) {
    test(`returns byte-wise order for two byte arrays: ${a}, ${b}`, () => {
      expect(bytesCompare(a, b)).toEqual(result);
    });
  }
});

describe('bytesIncrement', () => {
  const cases: [Uint8Array, Uint8Array][] = [
    [new Uint8Array([1]), new Uint8Array([2])],
    [new Uint8Array([1, 1]), new Uint8Array([1, 2])],
    [new Uint8Array([0]), new Uint8Array([1])],
    [new Uint8Array([255]), new Uint8Array([1, 0])],
    [new Uint8Array([254]), new Uint8Array([255])],
    [new Uint8Array([1, 0, 0, 255]), new Uint8Array([1, 0, 1, 0])],
    [new Uint8Array([255, 255, 255]), new Uint8Array([1, 0, 0, 0])],
    [new Uint8Array([0, 0, 1]), new Uint8Array([0, 0, 2])],
  ];

  for (const [input, output] of cases) {
    test(`increments byte array: ${input}`, () => {
      expect(bytesIncrement(input)).toEqual(output);
    });
  }
});

describe('bytesDecrement', () => {
  const passingCases: [Uint8Array, Uint8Array][] = [
    [new Uint8Array([1]), new Uint8Array([0])],
    [new Uint8Array([1, 2]), new Uint8Array([1, 1])],
    [new Uint8Array([1, 0]), new Uint8Array([0, 255])],
    [new Uint8Array([1, 0, 1, 0]), new Uint8Array([1, 0, 0, 255])],
    [new Uint8Array([0, 0, 2]), new Uint8Array([0, 0, 1])],
    [new Uint8Array([1, 0, 0, 0]), new Uint8Array([0, 255, 255, 255])],
  ];

  const failingCases: Uint8Array[] = [new Uint8Array([0]), new Uint8Array([0, 0])];

  for (const [input, output] of passingCases) {
    test(`decrements byte array: ${input}`, () => {
      expect(bytesDecrement(input)).toEqual(output);
    });
  }

  for (const input of failingCases) {
    test(`fails when decrementing byte array: ${input}`, () => {
      expect(() => bytesDecrement(input)).toThrow(HubError);
    });
  }
});

describe('numberToBytes', () => {
  const passingCases: [number, Uint8Array][] = [
    [1, new Uint8Array([1])],
    [255, new Uint8Array([255])],
    [256, new Uint8Array([0, 1])],
    [257, new Uint8Array([1, 1])],
    [26_309_012, new Uint8Array([148, 113, 145, 1])],
  ];

  for (const [input, output] of passingCases) {
    test(`converts number to little endian byte array: ${input}`, () => {
      expect(numberToBytes(input)).toEqual(output);
    });
  }

  const failingCases: number[] = [-1, 0, -26_309_012];

  for (const input of failingCases) {
    test(`fails with number: ${input}`, () => {
      expect(() => numberToBytes(input)).toThrow(HubError);
    });
  }
});