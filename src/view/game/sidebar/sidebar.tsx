import type { MutableRefObject } from "react";
import { AttributeInfoBox } from "./attributes-info-box";
import { CooldownsInfoBox } from "./cooldowns-info-box";
import "./sidebar.css";
import { TopRated } from "./top-rated";
import { UserInfoBox } from "./user-info-box";

export const SideBar = (props: {
  timestampAtPageLoad: MutableRefObject<number>;
}) => {
  const { timestampAtPageLoad } = props;

  return (
    <div id="side-bar">
      <CooldownsInfoBox
        timestampAtPageLoad={timestampAtPageLoad}
      />
      <UserInfoBox />
      <TopRated />
      <AttributeInfoBox />
    </div>
  );
};
