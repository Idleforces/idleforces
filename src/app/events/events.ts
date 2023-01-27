import type { ContestEventBlueprint } from "./types";
import { beta, triangular, exponential } from "@stdlib/random/base";
import { CONTEST_LENGTH } from "../contest/constants";
import {
  IMPLEMENTATION_SCALING_FACTOR,
  IMPLEMENTATION_TIME_BASE,
  PEN_PAPER_SOLVING_SCALING_FACTOR,
  PEN_PAPER_SOLVING_TIME_BASE,
} from "../problems/constants";
import {
  betaPrimeAltParam,
  computeExpectancyMultiplier,
} from "../problems/utils";

export const EVENTS: Readonly<Array<ContestEventBlueprint>> = [
  {
    name: "Toilet break",
    message: "You have an urge to go to the restroom. You try to be quick.",
    sentiment: "negative",
    isGlobal: true,
    phases: "all",
    probability: 3,
    probabilityScalingRateWithRateOfIncrement: 0,
    setBreakInTicks: {
      breakRemainingLength: 120,
      messageOnEndOfBreak: "You are now back from toilet.",
      isBlocking: true,
    },
  },

  {
    name: "Pizza break",
    message: "A pizza delivery is ready. You have to go pick it up.",
    sentiment: "negative",
    isGlobal: true,
    phases: "all",
    probability: 1,
    probabilityScalingRateWithRateOfIncrement: 0,
    setBreakInTicks: {
      breakRemainingLength: 300,
      messageOnEndOfBreak: "Pizza is here. Everybody party after the contest!",
      isBlocking: true,
    },
  },

  {
    name: "Power outage",
    message:
      "Oops, your area has been hit by a power outage. You can only pray the power goes back on.",
    sentiment: "negative",
    isGlobal: true,
    phases: "all",
    probability: 0.01,
    probabilityScalingRateWithRateOfIncrement: 0,
    setBreakInTicks: {
      breakRemainingLength: exponential(1 / CONTEST_LENGTH),
      messageOnEndOfBreak: "It looks like the power has been restored.",
      isBlocking: true,
    },
  },

  {
    name: "Internet outage",
    message:
      "There is a problem with your internet connection and you are unable to access the internet.",
    sentiment: "negative",
    isGlobal: true,
    phases: "all",
    probability: 0.05,
    probabilityScalingRateWithRateOfIncrement: 0,
    setBreakInTicks: {
      breakRemainingLength: exponential(10 / CONTEST_LENGTH),
      messageOnEndOfBreak: "Your internet connection has been restored.",
      isBlocking: true,
    },
  },

  {
    name: "Technical issue",
    message:
      "Your computer is experiencing technical issues and needs to be restarted.",
    sentiment: "negative",
    isGlobal: true,
    phases: "all",
    probability: 0.05,
    probabilityScalingRateWithRateOfIncrement: 0,
    setBreakInTicks: {
      breakRemainingLength: 240 * betaPrimeAltParam(1, 5),
      messageOnEndOfBreak:
        "Your computer has restarted and is now ready to use.",
      isBlocking: true,
    },
  },

  {
    name: "Distraction",
    message:
      "You get distracted by something unrelated to the contest and lose focus.",
    sentiment: "negative",
    isGlobal: false,
    phases: "all",
    probability: 1,
    probabilityScalingRateWithRateOfIncrement: 0.2,
    setBreakInTicks: {
      breakRemainingLength: 180 * betaPrimeAltParam(1, 2),
      messageOnEndOfBreak:
        "You are now refocused and ready to continue working on the contest. However, something is still lingering in your mind.",
      isBlocking: true,
    },
    setIncrement: (params) => {
      return params.increment * 0.85;
    },
  },

  {
    name: "Distracted by phone",
    message:
      "You get a notification on your phone and become distracted for a moment.",
    sentiment: "negative",
    isGlobal: true,
    phases: "all",
    probability: 0.5,
    probabilityScalingRateWithRateOfIncrement: 0,
    setBreakInTicks: {
      breakRemainingLength: 60 * betaPrimeAltParam(1, 1.5),
      messageOnEndOfBreak: "You are now back to focusing on the task at hand.",
      isBlocking: true,
    },
  },

  {
    name: "Well-known problem",
    message:
      "You found that you have seen the problem before and you remember the solution. The problem is pen-and-paper solved instantly.",
    sentiment: "positive",
    isGlobal: false,
    phases: ["during-pen-paper-solving"],
    probability: (params) => {
      const baseProbability = 3 / (10 * params.progress + 1);
      return baseProbability / (1 + Math.sqrt(params.submissions.length));
    },
    probabilityScalingRateWithRateOfIncrement: 1,
    setProgress: 1,
  },

  {
    name: "Easier pen-paper solution",
    message:
      "You just realized you have been thinking of a too complicated solution, and there is an easier way to do it.",
    sentiment: "positive",
    isGlobal: false,
    phases: ["during-pen-paper-solving"],
    probability: (params) => {
      const baseProbability = 2;
      return baseProbability / (1 + Math.sqrt(params.submissions.length) / 2);
    },
    probabilityScalingRateWithRateOfIncrement: 0.7,
    setProgress: (params) => {
      return triangular(params.progress, 1, (1 + params.progress) / 2);
    },
  },

  {
    name: "Wrong pen-paper solution",
    message:
      "Oops, the solution you've been designing is wrong. You are pushed back.",
    sentiment: "negative",
    isGlobal: false,
    phases: ["during-pen-paper-solving"],
    probability: (params) => {
      const baseProbability = 1.5;
      return (
        baseProbability * (1 + (2 * Math.sqrt(params.submissions.length)) / 3)
      );
    },
    probabilityScalingRateWithRateOfIncrement: 0.7,

    setProgress: (params) => {
      return triangular(params.progress, 1, (1 + params.progress) / 2);
    },
  },

  {
    name: "Out of ideas",
    message:
      "Oops, you are out of ideas for this problem. Your progress on this problem will be much slower.",
    sentiment: "negative",
    isGlobal: false,
    phases: ["during-pen-paper-solving"],
    probability: (params) => {
      const baseProbability = 0.3;
      return baseProbability * (1 + Math.sqrt(params.submissions.length) / 2);
    },
    probabilityScalingRateWithRateOfIncrement: 0.25,

    setIncrement: (params) => {
      return beta(1, 4) * params.increment;
    },
  },

  {
    name: "Great idea",
    message:
      "You got a great idea for the problem. You are now closer to solving the problem.",
    sentiment: "positive",
    isGlobal: false,
    phases: ["during-pen-paper-solving"],
    probability: 8,
    probabilityScalingRateWithRateOfIncrement: 0.6,
    setProgress: (params) => {
      return triangular(params.progress, 1, (3 * params.progress + 1) / 4);
    },
  },

  {
    name: "Similar problem",
    message:
      "You have realized the problem is similar to what you have done before. You are now closer to solving the problem.",
    sentiment: "positive",
    isGlobal: false,
    phases: ["during-pen-paper-solving"],
    probability: (params) => {
      const baseProbability = 8 / (10 * params.progress + 1);
      return baseProbability / (1 + Math.sqrt(params.submissions.length));
    },
    probabilityScalingRateWithRateOfIncrement: 0.75,
    setIncrement(params) {
      return (1 + exponential(2)) * params.increment;
    },
    setProgress: (params) => {
      return triangular(params.progress, 1, (5 * params.progress + 1) / 6);
    },
  },

  {
    name: "Eureka moment",
    message:
      "Suddenly, a light bulb goes off in your head and you have a breakthrough solution to the problem.",
    sentiment: "positive",
    isGlobal: false,
    phases: ["during-pen-paper-solving"],
    probability: (params) => {
      const baseProbability = 0.5;
      return baseProbability / (1 + Math.sqrt(params.submissions.length) / 2);
    },
    probabilityScalingRateWithRateOfIncrement: 0.8,
    setProgress: (params) => {
      return triangular(params.progress, 1, (4 + params.progress) / 5);
    },
  },

  {
    name: "Unfamiliar technique",
    message:
      "You found that the problem is testing a technique you are not comfortable with. You need to learn it and then solve the problem with it.",
    sentiment: "neutral",
    isGlobal: false,
    phases: ["during-pen-paper-solving"],
    probability: (params) => {
      const baseProbability = 2 / (2 * params.progress + 1);
      return baseProbability / (1 + Math.sqrt(params.submissions.length) / 2);
    },
    probabilityScalingRateWithRateOfIncrement: 0.6,
    setBreakInTicks: (params) => {
      return {
        breakRemainingLength:
          (PEN_PAPER_SOLVING_TIME_BASE *
            computeExpectancyMultiplier(
              params.tag,
              params.user.attributes[params.tag],
              params.penPaperDifficulty,
              PEN_PAPER_SOLVING_SCALING_FACTOR
            ) *
            betaPrimeAltParam(1, 3)) /
          5,
        messageOnEndOfBreak:
          "You have learned the technique. You are now closer to solving the problem.",
        isBlocking: false,
      };
    },

    setProgress: (params) => {
      return triangular(params.progress, 1, (2 * params.progress + 1) / 3);
    },
  },

  {
    name: "Bad time complexity",
    message:
      "You realized the time complexity of your solution is not good enough. You are trying to improve it.",
    sentiment: "negative",
    isGlobal: false,
    phases: ["during-pen-paper-solving"],
    probability: 2,
    probabilityScalingRateWithRateOfIncrement: 0.7,
    setProgress: (params) => {
      return triangular(0, params.progress, params.progress / 2);
    },
  },

  {
    name: "Minor bug",
    message: "Your implementation has a minor bug. You are working to fix it.",
    sentiment: "negative",
    isGlobal: false,
    phases: ["during-implementing"],
    probability: 5,
    probabilityScalingRateWithRateOfIncrement: 0.25,
    setBreakInTicks: (params) => {
      return {
        breakRemainingLength:
          (IMPLEMENTATION_TIME_BASE *
            computeExpectancyMultiplier(
              "implementationSpeed",
              params.user.attributes["implementationSpeed"],
              params.implementationDifficulty,
              IMPLEMENTATION_SCALING_FACTOR
            ) *
            betaPrimeAltParam(1, 2)) /
          8,
        messageOnEndOfBreak: "The bug has been fixed.",
        isBlocking: false,
      };
    },
  },

  {
    name: "Major bug",
    message: "Your implementation has a major bug. You are working to fix it.",
    sentiment: "negative",
    isGlobal: false,
    phases: ["during-implementing"],
    probability: 1,
    probabilityScalingRateWithRateOfIncrement: 0.5,
    setBreakInTicks: (params) => {
      return {
        breakRemainingLength:
          (IMPLEMENTATION_TIME_BASE *
            computeExpectancyMultiplier(
              "implementationSpeed",
              params.user.attributes["implementationSpeed"],
              params.implementationDifficulty,
              IMPLEMENTATION_SCALING_FACTOR
            ) *
            betaPrimeAltParam(1, 2)) /
          2,
        messageOnEndOfBreak: "The bug has been fixed.",
        isBlocking: false,
      };
    },
  },

  {
    name: "Pythonic problem",
    message:
      "You realized the problem is better to be implemented in Python. You are updating your editor config to Python.",
    sentiment: "neutral",
    isGlobal: false,
    phases: ["during-implementing"],
    probability: (params) => {
      const baseProbability = 5 / (10 * params.progress + 1);
      return baseProbability / (1 + 3 * Math.sqrt(params.submissions.length));
    },

    probabilityScalingRateWithRateOfIncrement: 0.25,
    setBreakInTicks: {
      breakRemainingLength: 60 * betaPrimeAltParam(1, 5),
      messageOnEndOfBreak: "Your editor is successfully set up.",
      isBlocking: false,
    },

    setIncrement: (params) => {
      return params.increment * (1 + 0.3 * betaPrimeAltParam(1, 2));
    },
  },

  {
    name: "Bitwise tricks",
    message:
      "You are finally making progress by using advanced bitwise tricks.",
    sentiment: "positive",
    isGlobal: false,
    phases: ["during-implementing"],
    probability: 0.75,
    probabilityScalingRateWithRateOfIncrement: 0.6,
    setProgress: (params) => {
      return triangular(params.progress, 1, (4 * params.progress + 1) / 5);
    },
  },

  {
    name: "e-maxx.ru lookup",
    message: "You are looking up implementation of a subroutine on e-maxx.ru.",
    sentiment: "neutral",
    isGlobal: false,
    phases: ["during-implementing"],
    probability: 0.5,
    probabilityScalingRateWithRateOfIncrement: 0.6,
    setBreakInTicks: (params) => {
      return {
        breakRemainingLength:
          (IMPLEMENTATION_TIME_BASE *
            computeExpectancyMultiplier(
              "implementationSpeed",
              params.user.attributes["implementationSpeed"],
              params.implementationDifficulty,
              IMPLEMENTATION_SCALING_FACTOR
            ) *
            betaPrimeAltParam(1, 1)) /
          4,
        messageOnEndOfBreak:
          "You have found everything you needed on e-maxx.ru.",
        isBlocking: false,
      };
    },

    setProgress: (params) => {
      return params.progress + beta(2, 1) * (1 - params.progress);
    },
  },

  {
    name: "Personal library lookup",
    message:
      "You are looking up implementation of a subroutine in your personal library.",
    sentiment: "neutral",
    isGlobal: false,
    phases: ["during-implementing"],
    probability: 1, // TODO - implement personal library and modify probability here.
    probabilityScalingRateWithRateOfIncrement: 0.6,
    setBreakInTicks: (params) => {
      return {
        breakRemainingLength:
          (IMPLEMENTATION_TIME_BASE *
            computeExpectancyMultiplier(
              "implementationSpeed",
              params.user.attributes["implementationSpeed"],
              params.implementationDifficulty,
              IMPLEMENTATION_SCALING_FACTOR
            ) *
            betaPrimeAltParam(1, 4)) /
          16,
        messageOnEndOfBreak:
          "You have found everything you needed in your personal library.",
        isBlocking: false,
      };
    },

    setProgress: (params) => {
      return params.progress + beta(2, 1) * (1 - params.progress);
    },
  },

  {
    name: "Bad time complexity of implementation",
    message:
      "You found out your implementation has higher than expected time complexity because you used slow data structures. You are replacing them with faster ones.",
    sentiment: "negative",
    isGlobal: false,
    phases: ["during-implementing"],
    probability: (params) => {
      return 0.75 * Math.pow(params.submissions.length + 1, 0.3);
    },
    probabilityScalingRateWithRateOfIncrement: 0.7,
    setProgress: (params) => {
      return triangular(0, params.progress, params.progress / 2);
    },
  },

  {
    name: "Code refactoring",
    message:
      "You realized that your code could be more efficient and easier to build on if you refactor it.",
    sentiment: "neutral",
    isGlobal: false,
    phases: ["during-implementing"],
    probability: 2,
    probabilityScalingRateWithRateOfIncrement: 0.3,
    setBreakInTicks: (params) => {
      return {
        breakRemainingLength:
          (IMPLEMENTATION_TIME_BASE *
            computeExpectancyMultiplier(
              "implementationSpeed",
              params.user.attributes["implementationSpeed"],
              params.implementationDifficulty,
              IMPLEMENTATION_SCALING_FACTOR
            ) *
            betaPrimeAltParam(1, 2)) /
          6,
        messageOnEndOfBreak:
          "You have finished refactoring your code and it is now running more efficiently.",
        isBlocking: true,
      };
    },
    setIncrement: (params) => {
      return params.increment * 1.3;
    },
  },

  {
    name: "Unreadable code",
    message: "You are struggling to read the code you wrote so far.",
    sentiment: "negative",
    isGlobal: false,
    phases: ["during-implementing"],
    probability: (params) => {
      const baseProbability = params.progress;
      return baseProbability * (1 + Math.sqrt(params.submissions.length) / 2);
    },
    probabilityScalingRateWithRateOfIncrement: 0.1,
    setIncrement: (params) => {
      return params.increment * beta(8, 3);
    },
  },
] as const;
