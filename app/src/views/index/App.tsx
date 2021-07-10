import React, { useEffect } from "react";
import { useState } from "react";
import { PageWrapper, GridWrapper, Button } from "./App.elements";
import Grid from "../../components/Grid";
import { PathAlgorithm } from "../../services/pathAlgoirthm";
import { AStarService } from "../../services/StarService";

const X_SIZE = 5;
const Y_SIZE = 5;
const aStarService: PathAlgorithm = new AStarService();

export default function App() {
  aStarService.setGridSize(X_SIZE, Y_SIZE);
  const [grid, setGrid] = useState(aStarService.getGrid());

  const handleRun = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();

    const res = await aStarService.runAlgorithm();
    for (let i = 0; i < res.states.length; i++) {
      setTimeout(() => {
        setGrid(res.states[i]);
      }, i * 100);
    }
  };

  const handleNodeClick = (index: number) => {
    aStarService.setTarget(index);
  };

  useEffect(() => {
    (async () => {
      await aStarService.initAlgorithm();
      aStarService.setTarget(8);
      setGrid(aStarService.getGrid());
    })();
  }, []);

  return (
    <PageWrapper>
      <GridWrapper>
        <Grid xSize={X_SIZE} ySize={Y_SIZE} grid={grid} handleNodeClick={handleNodeClick} />
      </GridWrapper>
      <Button onClick={(e) => handleRun(e)}>RUN</Button>
    </PageWrapper>
  );
}
