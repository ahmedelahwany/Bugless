import React from "react";
import { Progress } from "semantic-ui-react";

const ProgressBar = ({ uploadState, percentUploaded }) =>
  uploadState === "uploading" && (
    <Progress
      size="medium"
      progress
      className="progress__bar"
      indicating
      percent={percentUploaded}
      inverted
    />
  );

export default ProgressBar;
