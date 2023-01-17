import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { ContestSubmissionsFilterData } from "../status/status";
import {
  contestSubmissionVerdicts,
  problemPlacements,
} from "../../../../app/problems/types";
import type { ContestSubmissionVerdict } from "../../../../app/problems/types";
import type { ProblemPlacement } from "../../../../app/problems/types";
import { InfoBox } from "../../utils/info-box";
import "./submissions-filter-box.css";

export const SubmissionsFilterBox = (props: {
  contestSubmissionsFilterData: ContestSubmissionsFilterData;
  setContestSubmissionsFilterData: Dispatch<
    SetStateAction<ContestSubmissionsFilterData>
  >;
}) => {
  const { contestSubmissionsFilterData, setContestSubmissionsFilterData } =
    props;

  const [
    contestSubmissionsFilterDataLocal,
    setContestSubmissionsFilterDataLocal,
  ] = useState(contestSubmissionsFilterData);

  const handleReset = () => {
    const initialState: ContestSubmissionsFilterData = {
      problemPlacement: null,
      verdict: null,
      handle: "",
    };
    setContestSubmissionsFilterDataLocal(initialState);
    setContestSubmissionsFilterData(initialState);
  };

  const content = (
    <form
      id="submissions-filter-form"
      onSubmit={(e) => {
        e.preventDefault();
        setContestSubmissionsFilterData(contestSubmissionsFilterDataLocal);
      }}
    >
      <label htmlFor="submission-filter-problem">Problem:</label>
      <select
        name="submission-filter-problem"
        id="submission-filter-problem"
        onChange={(e) => {
          setContestSubmissionsFilterDataLocal((prev) =>
            e.target.value === "null"
              ? { ...prev, problemPlacement: null }
              : {
                  ...prev,
                  problemPlacement: e.target.value as ProblemPlacement,
                }
          );
        }}
      >
        {[
          <option value={"null"} key={"!!!-first-alphabetically"} selected={contestSubmissionsFilterDataLocal.problemPlacement === null}>
            any problem
          </option>,
        ].concat(
          problemPlacements.map((placement) => (
            <option value={placement} key={placement} selected={placement === contestSubmissionsFilterDataLocal.problemPlacement}>
              {placement}
            </option>
          ))
        )}
      </select>
      <label htmlFor="submission-filter-verdict">Verdict:</label>
      <select
        name="submission-filter-verdict"
        id="submission-filter-verdict"
        onChange={(e) => {
          setContestSubmissionsFilterDataLocal((prev) =>
            e.target.value === "null"
              ? { ...prev, verdict: null }
              : {
                  ...prev,
                  verdict: e.target.value as ContestSubmissionVerdict,
                }
          );
        }}
      >
        {[
          <option value={"null"} key={"!!!-first-alphabetically"} selected={contestSubmissionsFilterDataLocal.verdict === null}>
            any verdict
          </option>,
        ].concat(
          contestSubmissionVerdicts.map((verdict) => (
            <option value={verdict} key={verdict} selected={contestSubmissionsFilterDataLocal.verdict === verdict}>
              {verdict}
            </option>
          ))
        )}
      </select>

      <label htmlFor="submission-filter-handle">Participant:</label>
      <input
        type="text"
        id="submission-filter-handle"
        name="submission-filter-handle"
        value={contestSubmissionsFilterDataLocal.handle}
        onChange={(e) => {
          setContestSubmissionsFilterDataLocal((prev) => {
            return {
              ...prev,
              handle: e.target.value,
            };
          });
        }}
      />

      <div id="submissions-filter-form-actions-container">
        <input type="submit" value="Apply" />
        <input
          type="reset"
          value="Reset"
          onClick={(e) => {
            e.preventDefault();
            handleReset();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleReset();
            }
          }}
        />
      </div>
    </form>
  );

  return <InfoBox content={content} topText="Status filter" />;
};
