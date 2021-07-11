import React from "react";
import { ElementStatus } from "../../services/pathAlgoirthm";
import Node from "../Node";
import { StyledGrid } from "./Grid";

interface Props {
  xSize: number;
  ySize: number;
  grid: readonly ElementStatus[];
  handleNodeClick: (index: number) => void;
}

export default function Grid({ xSize, ySize, grid, handleNodeClick }: Props) {
  return (
    <>
      <StyledGrid xSize={xSize} ySize={ySize}>
        {grid.map((val, index) => (
          <Node status={val} value={index} key={index} handleNodeClick={handleNodeClick} />
        ))}
      </StyledGrid>
    </>
  );
}
