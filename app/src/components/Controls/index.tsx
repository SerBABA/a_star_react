import React from "react";
import { Controls, ControlsWrapper } from "./Controls";

export enum SetActionEnum {
  obstacle = 0,
  target,
  start,
}

interface Props {}

export default function index(props: Props) {
  return (
    <>
      <ControlsWrapper>
        <Controls>
          <option value={SetActionEnum.obstacle}>Set Obstacle</option>
          <option value={SetActionEnum.start}>Set Start</option>
          <option value={SetActionEnum.target}>Set Target</option>
        </Controls>
      </ControlsWrapper>
    </>
  );
}
