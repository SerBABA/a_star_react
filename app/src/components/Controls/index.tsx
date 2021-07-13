import React from "react";
import { Controls, ControlsWrapper, Button } from "./Controls";

export enum SetActionEnum {
  obstacle = "obstacle",
  target = "target",
  start = "start",
}

interface Props {
  value: string;
  setValue: (value: string) => void;
  handleRun: () => Promise<void>;
}

export default function Index(props: Props) {
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

        <Button
          onClick={(e) => {
            e.preventDefault();
            props.handleRun();
          }}
        >
          RUN
        </Button>
      </ControlsWrapper>
    </>
  );
}
