import styled from "styled-components";

interface Props {}

export const Node = styled.div<Props>`
  display: flex;
  justify-content: center;
  align-items: center;

  background-color: transparent;
  border: 1px solid black;

  height: auto;
  aspect-ratio: 1 / 1;

  &.unknown {
    background-color: white;
  }

  &.seen {
    background-color: lightblue;
  }

  &.processing {
    background-color: aqua;
  }

  &.processed {
    background-color: green;
  }

  &.obstacle {
    background-color: #898989;
  }

  &.path {
    background-color: red;
  }

  &.target {
    background-color: #ff6c6c;
  }

  &.start {
    background-color: #b9e2a0;
  }
`;
