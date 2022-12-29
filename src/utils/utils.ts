export const sigmoid = (x: number): number => {
  return 1 / (1 + Math.exp(-x));
};

export const sum = (array: Array<number>): number => {
  let s = 0;
  for (const elem of array) s += elem;
  return s;
};

export const normalizeArray = (array: Array<number>): Array<number> => {
  const s = sum(array);
  for (let i = 0; i < array.length; i++) array[i] /= s;
  return array;
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
 * Declares a variable of type `Record<T, U>` from an initializer without listing all properties. This function is not type-safe -- if the below assumptions don't hold, there is no guarantee that the resulting type will be correct.
 * @param indexObject Object whose keys are exactly the string literals from the union type `T`.
 * @param initializer A function from a string literal in `T` to `U`.
 * @returns A variable `newVar` of type `Record<T, U>` such that for any `key in T`, `newVar[key] = initializer(key)`.
 * @example
 * enum ourEnum {
 *   key1 = "key1",
 *   key2 = "key2",
 * }
 * type OurEnumType = keyof typeof ourEnum;
 *
 * const initializer = (ourEnum: OurEnumType): number => {
 *   switch (ourEnum) {
 *     case "key1":
 *       return 1;
 *     case "key2":
 *       return 2;
 *   }
 * };
 *
 * console.log(declareRecordByInitializer(ourEnum, initializer));
 * // prints {key1: 1, key2: 2}
 */

export function declareRecordByInitializer<T extends string, U>(
  indexObject: { [K in T]: any }, // eslint-disable-line @typescript-eslint/no-explicit-any
  initializer: (propName: keyof typeof indexObject) => U
): Record<T, U> {
  const returnRecord: Partial<Record<T, U>> = {};
  for (const key of Object.keys(indexObject) as Array<T>) {
    returnRecord[key] = initializer(key);
  }

  return returnRecord as Record<T, U>;
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
