import styled from "styled-components";

interface Props {
  xSize: number;
  ySize: number;
}

export const Grid = styled.div<Props>`
  display: grid;
  display: -ms-grid;
  display: -moz-grid;

  width: 100%;
  height: 100%;

  grid-template-columns: repeat(${(props) => props.xSize}, 1fr);
  grid-template-rows: repeat(${(props) => props.ySize}, 1fr);
`;
