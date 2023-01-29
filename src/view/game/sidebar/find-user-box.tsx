import { useState } from "react";
import { useNavigate } from "react-router";
import { useAppSelector } from "../../../app/hooks";
import { selectUsers } from "../../../app/users/users-slice";
import { InfoBox } from "../utils/info-box";
import "./find-user-box.css";

export const FindUserBox = () => {
  const [searchedHandle, setSearchedHandle] = useState("");
  const [userNotFound, setUserNotFound] = useState(false);

  const navigate = useNavigate();

  const users = useAppSelector(selectUsers);
  if (!users) return <></>;

  const content = (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const handleSubmitted = searchedHandle;
          const foundUser = users.find(
            (user) => user.handle === handleSubmitted
          );

          setSearchedHandle("");
          setUserNotFound(!foundUser);
          if (foundUser) navigate(`/game/profile/${handleSubmitted}`);
        }}
      >
        <label htmlFor="find-user-input">Handle: </label>
        <input
          type="text"
          value={searchedHandle}
          onChange={(e) => {
            setSearchedHandle(e.target.value);
          }}
          name="find-user-input"
          id="find-user-input"
        />
        <div id="find-users-submit-button-container">
          <input type="submit" value="Find" />
        </div>
      </form>
      {userNotFound ? <span className="dark-red bold">User not found</span> : <></>}
    </>
  );

  return <InfoBox content={content} topText="Find user" />;
};
