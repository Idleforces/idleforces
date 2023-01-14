export type LocalStorageSaveData = {
  rating: number;
  handle: string;
  saveName: string;
  usersHash: string;
  eventsHash: string;
  contestHash: string;
  contestArchiveHash: string;
  friendsHash: string;
  inContest: boolean;
};

export type LocalStorageSavesValue = Array<LocalStorageSaveData>;

export type ContestTypeRunning = {
  playerParticipating: boolean;
} | null;
