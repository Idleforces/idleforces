import type { Activity } from "../../app/save/save-slice";

export type LocalStorageSaveData = {
  rating: number;
  handle: string;
  saveName: string;
  usersHash: string;
  eventsHash: string;
  contestHash: string;
  contestArchiveHash: string;
  friendsHash: string;
  booksHash: string;
  NPCsHash: string;
  activity: Activity;
};

export type LocalStorageSavesValue = Array<LocalStorageSaveData>;
