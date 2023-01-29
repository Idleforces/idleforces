import type { Activity } from "../../../app/save/save-slice";

export const computeActivityErrorMessage = (
  activity: Exclude<Activity, null>
) => {
  let errorMessageActivityPart: string;

  switch (activity) {
    case "book-reading":
      errorMessageActivityPart = "book reading";
      break;
    case "contest-participation":
      errorMessageActivityPart = "contest";
      break;
    case "contest-simulation":
      errorMessageActivityPart = "contest";
      break;
  }

  return `Please finish ${errorMessageActivityPart} first.`;
};
