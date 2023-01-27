import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import { useAppSelector } from "../../../app/hooks";
import { selectPlayer } from "../../../app/users/users-slice";
import { InfoBox } from "../utils/info-box";
import { RatingStyled } from "../utils/styled-rating";
import "./user-info-box.css";

export const UserInfoBox = () => {
  const player = useAppSelector(selectPlayer);
  if (!player) return <></>;

  const handle = player.handle;
  const rating = player.ratingHistory.slice(-1)[0].rating;

  const infoBoxContent = (
    <div id="user-info-box-content">
      <div id="user-info-box-content-left-bar">
        <p>
          Rating:{" "}
          <RatingStyled stringToStyle={Math.round(rating)} rating={rating} />
        </p>
        <ul>
          <li>
            <Link to={`/game/profile/${handle}/contests`}>Contests</Link>
          </li>
        </ul>
      </div>
      <div id="user-info-box-content-right-bar">
        <FontAwesomeIcon icon={["fas", "user"]} />
        <Link to={`/game/profile/${handle}`}>
          <RatingStyled stringToStyle={handle} rating={rating} />
        </Link>
      </div>
    </div>
  );

  return <InfoBox content={infoBoxContent} topText={handle} />;
};
