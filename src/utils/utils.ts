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
  for (let i = 0; i<array.length; i++) array[i] /= s;
  return array;
}

type Iterableify<T> = { [K in keyof T]: Iterable<T[K]> }

export function* zip<T extends Array<any>>(
  ...toZip: Iterableify<T>
): Generator<T> {
  // Get iterators for all of the iterables.
  const iterators = toZip.map(i => i[Symbol.iterator]())

  while (true) {
      // Advance all of the iterators.
      const results = iterators.map(i => i.next())

      // If any of the iterators are done, we should stop.
      if (results.some(({ done }) => done)) {
          break
      }

      // We can assert the yield type, since we know none
      // of the iterators are done.
      yield results.map(({ value }) => value) as T
  }
}

export const safeSetLocalStorageValue = (
  key: string,
  value: string,
  leaveGame: () => void
) => {
  try {
    localStorage.setItem(key, value);
  } catch (e: any) {
    if (e.code == 22 || e.code == 1014) {
      alert(
        "Local storage quota has been exceeded. Please delete some saves to continue"
      );
      leaveGame();
    }

    else {
      alert(
        `Unknown error ERRCODE:${e.code} was caught.`
      );
      leaveGame();
    }
  }
};
