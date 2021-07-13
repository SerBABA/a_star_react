import React from "react";
import { ElementStatus } from "../../services/pathAlgoirthm";
import Node from "../Node";
import { StyledGrid } from "./Grid";

interface Props {
  xSize: number;
  ySize: number;
  grid: readonly ElementStatus[];
  targetIndex: number;
  startIndex: number;
  handleNodeClick: (index: number) => void;
}

export default function Grid(props: Props) {
  const getStatusClass = (val: ElementStatus, index: number) => {
    if (index === props.startIndex) return "start";
    if (index === props.targetIndex) return "target";
    return val;
  };

  return (
    <>
      <StyledGrid xSize={props.xSize} ySize={props.ySize}>
        {props.grid.map((val, index) => (
          <Node
            status={getStatusClass(val, index)}
            value={index}
            key={index}
            handleNodeClick={props.handleNodeClick}
          />
        ))}
      </StyledGrid>
    </>
  );
}
