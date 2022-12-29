export const convertSecondsToHHMM = (seconds: number): string => {
  return new Date(seconds * 1000).toLocaleTimeString("en-US", {
    hour: "numeric",
    hour12: true,
    minute: "numeric",
  });
};
