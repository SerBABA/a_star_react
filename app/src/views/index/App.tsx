import React, { useEffect } from "react";
import { useState } from "react";
import { PageWrapper, GridWrapper } from "./App.elements";
import Grid from "../../components/Grid";
import { ElementStatus, PathAlgorithm } from "../../services/pathAlgoirthm";
import { AStarService } from "../../services/StarService";
import Controls, { SetActionEnum } from "./../../components/Controls";

const X_SIZE = 10;
const Y_SIZE = 10;
const aStarService: PathAlgorithm = new AStarService();

const useControlPanel = () => {
  const [action, setAction] = useState("target");

  const updateAction = (choice: string) => {
    setAction(choice);
  };

  const handleClick = async (index: number) => {
    switch (action) {
      case SetActionEnum.obstacle:
        if (aStarService.getGridElement(index) !== ElementStatus.OBSTACLE) {
          aStarService.setGridElement(ElementStatus.OBSTACLE, index);
        } else {
          aStarService.setGridElement(ElementStatus.UNKNOWN, index);
        }
        break;
      case SetActionEnum.start:
        aStarService.setStart(index);
        break;
      case SetActionEnum.target:
        aStarService.setTarget(index);
        break;
      default:
        alert("How did you do this?");
    }
  };

  return { action, handleClick, updateAction };
};

export default function App() {
  aStarService.setGridSize(X_SIZE, Y_SIZE);
  const [grid, setGrid] = useState(aStarService.getGrid());
  const { action, handleClick, updateAction } = useControlPanel();

  const handleNodeClick = async (index: number) => {
    await handleClick(index);
    setGrid(aStarService.getGrid());
  };

  const handleRun = async () => {
    const res = await aStarService.runAlgorithm();
    for (let i = 0; i < res.states.length; i++) {
      setTimeout(() => {
        setGrid(res.states[i]);
      }, i * 35);
    }
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
        <Grid
          xSize={X_SIZE}
          ySize={Y_SIZE}
          startIndex={aStarService.getStart()}
          targetIndex={aStarService.getTarget()}
          grid={grid}
          handleNodeClick={handleNodeClick}
        />
      </GridWrapper>
      <Controls value={action} setValue={updateAction} handleRun={handleRun} />
    </PageWrapper>
  );
}
