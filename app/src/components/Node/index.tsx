import React from "react";
import { ElementStatus } from "../../services/pathAlgoirthm";

import { Node } from "./Node";

interface Props {
  status: ElementStatus | string;
  value: number;
  handleNodeClick: (index: number) => void;
}

export default function index({ status, value, handleNodeClick }: Props) {
  return (
    <>
      <Node
        className={status}
        onClick={(event) => {
          event.preventDefault();
          handleNodeClick(value);
        }}
        onPointerOver={(e) => console.log(e)}
      >
        {value}
      </Node>
    </>
  );
}
