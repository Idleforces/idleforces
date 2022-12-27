import type { AttributeConstant } from "./types";
export const XPToLevel = (
  XP: number,
  attributeConstant: AttributeConstant
): number => {
  const minValue = attributeConstant.MIN_VALUE;
  const maxValue = attributeConstant.MAX_VALUE;
  const hardness = attributeConstant.hardness;
  if (XP < 0 || hardness <= 0) {
    console.warn("Function XPToLevel received invalid input.");
    return 0;
  }

  return (
    Math.pow((2 * Math.atan(XP / (1000 * hardness))) / Math.PI, 0.4) *
      (maxValue - minValue) +
    minValue
  );
};

export const levelToXP = (
  level: number,
  attributeConstant: AttributeConstant
): number => {
  const minValue = attributeConstant.MIN_VALUE;
  const maxValue = attributeConstant.MAX_VALUE;
  const hardness = attributeConstant.hardness;
  if (level < minValue || level > maxValue || hardness <= 0) {
    console.warn("Function levelToXP received invalid input.");
    return 0;
  }

  let lowerBound = 0,
    upperBound = 1000000000;
  for (let i = 0; i < 50; i += 1) {
    const midpoint = (lowerBound + upperBound) / 2;
    const levelAtMidpoint = XPToLevel(midpoint, attributeConstant);
    if (levelAtMidpoint > level) upperBound = midpoint;
    else lowerBound = midpoint;
  }

  return lowerBound;
};

export const normalizeLevelOfAttribute = (
  level: number,
  attributeConstant: AttributeConstant
) => {
  if (
    level < attributeConstant.MIN_VALUE ||
    level > attributeConstant.MAX_VALUE
  ) {
    console.warn("Bad input to normalizeLevelOfAttribute function");
    return 0;
  }
  return (
    (level - attributeConstant.MIN_VALUE) /
    (attributeConstant.MAX_VALUE - attributeConstant.MIN_VALUE)
  );
};
