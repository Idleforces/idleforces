import type { MutableRefObject } from "react";
import { AttributeInfoBox } from "./attributes-info-box";
import { CooldownsInfoBox } from "./cooldowns-info-box";
import "./sidebar.css";
import { TopRated } from "./top-rated";
import { UserInfoBox } from "./user-info-box";

export const SideBar = (props: {
  secondsSincePageLoad: number;
  timestampAtPageLoad: MutableRefObject<number>;
}) => {
  const { secondsSincePageLoad, timestampAtPageLoad } = props;

  return (
    <div id="side-bar">
      <CooldownsInfoBox
        secondsSincePageLoad={secondsSincePageLoad}
        timestampAtPageLoad={timestampAtPageLoad}
      />
      <UserInfoBox />
      <TopRated />
      <AttributeInfoBox />
    </div>
  );
};
