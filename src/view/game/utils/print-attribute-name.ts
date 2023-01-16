import { capitalize, lowerCase } from "lodash";
import type { AttributeNames } from "../../../app/users/types";

export const printAttributeName = (attribute: AttributeNames) => {
  return capitalize(lowerCase(attribute));
};
