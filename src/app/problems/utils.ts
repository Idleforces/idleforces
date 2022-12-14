import { USER_ATTRIBUTES_CONSTANTS } from "../users/constants";
import { AttributeNames } from "../users/types";
import { normalizeLevelOfAttribute } from "../users/utils";
import logit from "@stdlib/math/base/special/logit";
import { betaprime } from "@stdlib/random/base";

/**
 * 
 * @param exp The expectation of the desired distribution.
 * @param v The precision of the desired distribution. Converges in distribution to constant mean as v -> \infty.
 * @link https://en.wikipedia.org/wiki/Beta_prime_distribution
 * @returns Sample from betaPrime distribuion.
 */
export const betaPrimeAltParam = (exp: number, v: number): number => {
    if (Number.isNaN(exp) || Number.isNaN(v) || exp <= 0 || v <= 0) {
        console.warn("Bad input was passed to betaPrimeAltParam function.");
        return 0;
    }

    return betaprime(exp * (1 + v), 2 + v);
}

export const computeExpectancyMultiplier = (
  userAttributeName: AttributeNames,
  userAttributeLevel: number,
  problemAttributeValue: number,
  scalingFactor: number,
): number => {
  const normalizedUserAttributeValue = normalizeLevelOfAttribute(
    userAttributeLevel,
    USER_ATTRIBUTES_CONSTANTS[userAttributeName]
  );

  return Math.pow(scalingFactor, logit(problemAttributeValue - normalizedUserAttributeValue));
};
