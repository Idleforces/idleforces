import { User } from "./usersSlice";

export const fetchUsersAbortController = new AbortController();
export const fetchUsers = async () => {
  const signal = fetchUsersAbortController.signal;
  const response = await fetch("users.json", {
    signal,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  }).catch((err) => console.log(err.message));
  const users: Array<User> = await response
    ?.json()
    .then((responseObj) => responseObj.result);
  console.log(users[0]);
  return users;
};
