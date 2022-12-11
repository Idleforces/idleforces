export const sigmoid = (x: number): number => {
  return 1 / (1 + Math.exp(-x));
};

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
