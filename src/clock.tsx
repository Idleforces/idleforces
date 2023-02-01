import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import {
  selectSecondsSincePageLoad,
  selectTimestampAtPageLoad,
  setSecondsSincePageLoad,
} from "./app/view/view-slice";

export const Clock = () => {
  const dispatch = useAppDispatch();

  const secondsSincePageLoad = useAppSelector(selectSecondsSincePageLoad);
  const timestampAtPageLoad = useAppSelector(selectTimestampAtPageLoad);

  useEffect(() => {
    let ignore = false;
    void new Promise((resolve, _reject) => {
      setTimeout(() => {
        if (!ignore) {
          dispatch(
            setSecondsSincePageLoad(
              secondsSincePageLoad +
                Math.max(
                  Math.floor(
                    (-timestampAtPageLoad + Date.now()) / 1000 -
                      secondsSincePageLoad
                  ) - 1,
                  1
                )
            )
          );
          resolve("DONE");
        } else {
          resolve("IGNORED");
        }
      }, Math.max(timestampAtPageLoad - Date.now() + 1000 * (secondsSincePageLoad + 1), 0));
    });

    return () => {
      ignore = true;
    };
  }, [secondsSincePageLoad, dispatch, timestampAtPageLoad]);

  return <></>;
};
