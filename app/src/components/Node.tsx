import styled from "styled-components";
import { ElementStatus } from "../services/pathAlgoirthm";

interface Props {
  state: ElementStatus;
}

export const Node = styled.div<Props>`
  display: grid;
  display: -ms-grid;
  display: -moz-grid;

  width: 100%;
  height: 100%;
`;
