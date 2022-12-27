import { poisson } from "@stdlib/random/base";

/**
 *
 * @param canBecomeActiveArray array of booleans determining if the respective problems can become active.
 * @param willingnessToTryHarderProblems determines how probable is that a harder problem will become active
 * @returns position of the next active problem or `null` if all elements of `canBecomeActiveArray` are `false`.
 */
export const computeActiveProblemPosition = (
  canBecomeActiveArray: Array<boolean>,
  willingnessToTryHarderProblems: number
): number | null => {
  const problemsPositionsThatCanBecomeActive = canBecomeActiveArray
    .map((canBecomeActive, position) => {
      return { canBecomeActive, position };
    })
    .filter(({ canBecomeActive }) => canBecomeActive)
    .map(({ position }) => position);
  if (problemsPositionsThatCanBecomeActive.length === 0) return null;

  const MAX_ITERATIONS = 100;
  for (let _ = 0; _ < MAX_ITERATIONS; _++) {
    const easierThanNewActiveProblemCount = poisson(
      willingnessToTryHarderProblems
    );
    if (
      easierThanNewActiveProblemCount <
      problemsPositionsThatCanBecomeActive.length
    )
      return problemsPositionsThatCanBecomeActive[
        easierThanNewActiveProblemCount
      ];
  }

  return problemsPositionsThatCanBecomeActive[0];
};
