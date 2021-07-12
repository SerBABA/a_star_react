import React from "react";
import { Controls, ControlsWrapper } from "./Controls";

export enum SetActionEnum {
  obstacle = "obstacle",
  target = "target",
  start = "start",
}

interface Props {
  value: string;
  setValue: (value: string) => void;
}

export default function index(props: Props) {
  return (
    <>
      <ControlsWrapper>
        <Controls
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => props.setValue(e.target.value)}
          value={props.value}
        >
          <option value={SetActionEnum.obstacle}>Set Obstacle</option>
          <option value={SetActionEnum.start}>Set Start</option>
          <option value={SetActionEnum.target}>Set Target</option>
        </Controls>
      </ControlsWrapper>
    </>
  );
}
