import { AttributeInfoBox } from "./attributes-info-box";
import { CooldownsInfoBox } from "./cooldowns-info-box";
import { FindUserBox } from "./find-user-box";
import "./sidebar.css";
import { TopRated } from "./top-rated";
import { UserInfoBox } from "./user-info-box";

export const SideBar = () => {
  return (
    <div id="side-bar">
      <CooldownsInfoBox />
      <UserInfoBox />
      <TopRated />
      <FindUserBox />
      <AttributeInfoBox />
    </div>
  );
};
