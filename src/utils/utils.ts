export const sigmoid = (x: number): number => {
  return 1 / (1 + Math.exp(-x));
};

export const sum = (array: Array<number>): number => {
  let s = 0;
  for (const elem of array) s += elem;
  return s;
};

type Iterableify<T> = { [K in keyof T]: Iterable<T[K]> };

export function* zip<T extends Array<any>>( // eslint-disable-line @typescript-eslint/no-explicit-any
  ...toZip: Iterableify<T>
): Generator<T> {
  // Get iterators for all of the iterables.
  const iterators = toZip.map((i) => i[Symbol.iterator]());

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  while (true) {
    // Advance all of the iterators.
    const results = iterators.map((i) => i.next());

    // If any of the iterators are done, we should stop.
    if (results.some(({ done }) => done)) {
      break;
    }

    // We can assert the yield type, since we know none
    // of the iterators are done.
    yield results.map(({ value }) => value) as T; // eslint-disable-line @typescript-eslint/no-unsafe-return
  }
}

export const sleep = (ms: number) => {
  return new Promise<void>((resolve) =>
    setTimeout(() => {
      resolve();
    }, ms)
  );
};

/**
 *
 * @param array Array of elements to sample from.
 * @param probs Array of not necessarily normalized probabilities of elements or `null` in case of uniform sampling.
 * @throws If any prob is `NaN` or less than `0` or `array` and `probs` have different lengths.
 * @returns Sample from `array` according to `probs`.
 */
export function sample<T>(
  array: Exclude<Array<T>, []>,
  probs: Array<number> | null
): T {
  if (probs === null) probs = Array(array.length).fill(1);
  if (array.length !== probs.length)
    throw Error("Bad input to sample function.");
  const sumProbs = sum(probs);
  if (sumProbs <= 0) throw Error("Bad input to sample function.");
  let cur = 0;
  const target = Math.random();

  for (const [elem, prob] of zip(array, probs)) {
    if (Number.isNaN(prob) || prob < 0)
      throw Error("Bad input to sample function.");
    if (target <= cur + prob / sumProbs) return elem;
    cur += prob / sumProbs;
  }

  return array[0];
}

/**
 * Declares a variable of type `Record<T, U>` from an initializer without listing all properties.
 * @param indexObject Readonly array of string literals from the union type `T`.
 * @param initializer A function from a string literal in `T` to `U`.
 * @returns A variable `newVar` of type `Record<T, U>` such that for any `key in T`, `newVar[key] = initializer(key)`.
 * @example
 * const stringLiteralConstArray = ["key1", "key2"] as const;
 * type StringLiteralUnionType = typeof stringLiteralConstArray[number];
 *
 * const initializer = (stringLiteral: StringLiteralUnionType): number => {
 *   switch (stringLiteral) {
 *     case "key1":
 *       return 1;
 *     case "key2":
 *       return 2;
 *   }
 * };
 * console.log(declareRecordByInitializer(ourEnum, initializer));
 * // prints {key1: 1, key2: 2}
 */

export function declareRecordByInitializer<T extends string | number | symbol, U>(
  indexArray: Readonly<Array<T>>,
  initializer: (index: T) => U
): Record<T, U> {
  const returnRecord: Partial<Record<T, U>> = {};
  for (const index of indexArray) {
    returnRecord[index] = initializer(index);
  }

  return returnRecord as Record<T, U>;
}

export function transposeArray<T>(array: Array<Array<T>>) {
  if (!array.length || !array[0].length) return array;
  return array[0].map((_, colIndex) => array.map((row) => row[colIndex]));
}

export const safeSetLocalStorageValue = (
  key: string,
  value: string,
  leaveGame: () => void
) => {
  try {
    localStorage.setItem(key, value);
  } catch (e: unknown) {
    if (typeof e === "object" && e && "code" in e && typeof e.code === "number")
      if (e.code == 22 || e.code == 1014) {
        alert(
          "Local storage quota has been exceeded. Please delete some saves to continue"
        );
        leaveGame();
      } else {
        alert(
          `Unknown error ERRCODE:${e.code} was caught while saving into local storage.`
        );
        leaveGame();
      }
    else alert("Unknown error was caught while saving into local storage.");
  }
};
