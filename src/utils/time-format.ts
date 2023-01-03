export const convertSecondsToHHMM = (seconds: number): string => {
  return new Date(seconds * 1000).toUTCString().slice(17, 22);
};

export const convertSecondsToHHMMSS = (seconds: number): string => {
  return new Date(seconds * 1000).toUTCString().slice(17, 25);
};
