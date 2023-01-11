export const computeUserTitle = (rating: number) => {
  return rating >= 2600
    ? "International grandmaster"
    : rating >= 2400
    ? "Grandmaster"
    : rating >= 2300
    ? "International master"
    : rating >= 2100
    ? "Master"
    : rating >= 1900
    ? "Candidate master"
    : rating >= 1600
    ? "Expert"
    : rating >= 1400
    ? "Specialist"
    : rating >= 1200
    ? "Pupil"
    : "Newbie";
};
