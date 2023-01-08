import { assert } from "vitest";
import { loadEnv } from "vite";

/**Asserts that the target is equal to expected, usually within a +/- delta range.
 * Configure `weak` value so that:
 *
 * `weak = true` should be used for production builds so that the tests will only fail when something goes way off.
 *
 * `weak = false` should be used for fine-tuning `expected` and `delta` parameters.
 *
 *@param actual - Actual value.
 *@param expected - Potential expected value.
 *@param delta - Heuristically, this should be set to something like (2 + \epsilon) standard deviations, but since we're humans, we should just be eyeballing with `weak` turned off.
 *@param message - Message to display on error.
 */
export const assertProbabilisticCloseTo = (
  actual: number,
  expected: number,
  delta: number,
  message?: string
): void => {
  const env = loadEnv("", process.cwd(), "");
  const weak = env.VITE_weak === "true" ? true : false;

  if (weak) assert.closeTo(actual, expected, 2 * delta, message);
  else assert.closeTo(actual, expected, delta, message);
};
