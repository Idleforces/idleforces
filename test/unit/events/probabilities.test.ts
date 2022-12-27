import { describe, it, assert } from "vitest";
import { EVENTS } from "../../../src/app/events/events";
import { computeProbabilitiesOfEvents } from "../../../src/app/events/process-event";
import type { EventProbabilityParams } from "../../../src/app/events/types";
import { sum } from "../../../src/utils/utils";
import { computeMockSubmission } from "../../mocks/mock-submission";

describe("computeProbabilitiesOfEvents function", () => {
  it("computes reasonable probabilities reasonably responding to submissions, progress and increment change", () => {
    const firstEventProbabilityParams: EventProbabilityParams = {
      progress: 0.2,
      submissions: [computeMockSubmission()],
    };

    const secondEventProbabilityParams: EventProbabilityParams = {
      progress: 0.7,
      submissions: Array(5)
        .fill(0)
        .map((_) => computeMockSubmission()),
    };

    const firstProbabilitiesOfEvents = computeProbabilitiesOfEvents(
      EVENTS,
      1 / 2000,
      firstEventProbabilityParams
    );

    const secondProbabilitiesOfEvents = computeProbabilitiesOfEvents(
      EVENTS,
      1 / 600,
      secondEventProbabilityParams
    );

    const firstProbabilitiesOfEventsSum = sum(firstProbabilitiesOfEvents);
    const secondProbabilitiesOfEventsSum = sum(secondProbabilitiesOfEvents);

    assert.closeTo(firstProbabilitiesOfEventsSum, 1 / 1800, 1 / 5000);
    assert.closeTo(secondProbabilitiesOfEventsSum, 1 / 1000, 1 / 3000);
  });
});
