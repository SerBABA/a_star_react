import React from "react";
import { Grid } from "./../../components/Grid";
import { PathAlgorithm } from "../../services/pathAlgoirthm";
import { AStarService } from "../../services/StarService";

const X_SIZE = 5;
const Y_SIZE = 5;

export default function App() {
  const aStarService: PathAlgorithm = new AStarService();
  aStarService.setGridSize(X_SIZE, Y_SIZE);

  return (
    <main>
      <Grid xSize={X_SIZE} ySize={Y_SIZE} />
    </main>
  );
}
