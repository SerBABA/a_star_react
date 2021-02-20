import React, { useState } from "react";
import { NodeClass, getAStarSteps, GridClass, nodeState } from "./a_star";
import "./App.css";

const A_STAR_UPDATE_MS_DELAY = 45;
const X_SIZE = 8;
const Y_SIZE = 8;

enum changeEnum {
  target = "target",
  source = "source",
  obstacle = "obstacle",
  none = "none",
}

function App() {
  // base grid of the entire background.
  const [grid, setGrid] = useState(new GridClass(X_SIZE, Y_SIZE));
  const [running, setRunning] = useState(false);

  // Keeps the state to show of the grid
  const [gridState, setGridState] = useState(grid.state);

  // Stores the actual coordiantes. unable to force the type sadly :(
  const [sourceCoords, setSourceCoords] = useState({ x: 2, y: 3 });
  const [targetCoords, setTargetCoords] = useState({ x: 7, y: 2 });

  // Stores the source and target nodes
  const sourceNode = grid.getNode(sourceCoords.x, sourceCoords.y);
  const targetNode = grid.getNode(targetCoords.x, targetCoords.y);

  // Similar to a radio button
  const [selectionType, setSelectionType] = useState(changeEnum.none);

  // Accessing grid?
  const getGrid = (): GridClass => {
    return grid;
  };

  // Handles the change of the target node.
  const handleChangeEnumAssignment = (x: number, y: number) => {
    if (running) return;

    switch (selectionType) {
      case changeEnum.target:
        setTargetCoords({ x, y });
        break;

      case changeEnum.source:
        setSourceCoords({ x, y });
        break;

      case changeEnum.obstacle:
        let node = grid.getNode(x, y);
        let newValue = nodeState.obstacle;
        if (node) {
          // the new value
          if (node.state === nodeState.obstacle) {
            newValue = nodeState.unknown;
          }

          // Update the visual
          var gridStateCopy = gridState.slice();
          gridStateCopy[getGrid().getIndex(x, y)].state = newValue;
          setGridState(gridStateCopy);

          // Update the grid state ++ add safety for non real nodes
          node.state = newValue;
          setGrid(grid);
        }
        break;

      default:
        alert("Select an assignment please!");
    }
  };

  // This runs the software to create the history states.
  const handleRunClick = (sourceNode: NodeClass, targetNode: NodeClass) => {
    getAStarSteps(grid, sourceNode, targetNode)
      .then((stateHistory) => {
        setRunning(true);
        for (let i = 0; i < stateHistory.length; i++) {
          setTimeout(() => {
            setGridState(stateHistory[i]);
            if (i + 1 >= stateHistory.length) setRunning(false);
          }, A_STAR_UPDATE_MS_DELAY * i);
        }
      })
      .catch(() => {});
  };

  // Resets the grid to its original state.
  const handleResetClick = async () => {
    const originalGridState = await grid.resetGridState();
    setGridState(originalGridState);
  };

  // We beed the source and target nodes to exist to run the A* algorithm
  if (sourceNode && targetNode) {
    return (
      <div>
        <Grid
          grid={gridState}
          xSize={grid.xSize}
          ySize={grid.ySize}
          handleChange={handleChangeEnumAssignment}
        ></Grid>
        <button onClick={() => handleRunClick(sourceNode, targetNode)} disabled={running}>
          run!
        </button>
        <button onClick={handleResetClick} disabled={running}>
          reset!
        </button>
        <div>
          <label>
            <input
              type="radio"
              value="source"
              name="action"
              onClick={() => setSelectionType(changeEnum.source)}
              disabled={running}
            ></input>
            Source
          </label>
          <label>
            <input
              type="radio"
              value="target"
              name="action"
              onClick={() => setSelectionType(changeEnum.target)}
              disabled={running}
            ></input>
            Target
          </label>
          <label>
            <input
              type="radio"
              value="obstacle"
              name="action"
              onClick={() => setSelectionType(changeEnum.obstacle)}
              disabled={running}
            ></input>{" "}
            Obstacle
          </label>
        </div>
      </div>
    );
  } else {
    return <span>Missing source and target node!</span>;
  }
}

// Grid represents and contains the grid appearence.
type gridProps = {
  grid: NodeClass[];
  xSize: number;
  ySize: number;
  handleChange: (x: number, y: number) => void;
};
function Grid(props: gridProps) {
  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${props.xSize}, 1fr)`,
        gridTemplateRows: `repeat(${props.ySize}, 1fr)`,
      }}
    >
      {props.grid.map((node, index) => {
        return <Slot data={node} key={index} item={index} handleChange={props.handleChange} />;
      })}
    </div>
  );
}

// Slot represents a node on a grid.
type slotProps = {
  data: NodeClass;
  item: number;
  handleChange: (x: number, y: number) => void;
};
function Slot(props: slotProps) {
  const data = props.data;

  return (
    <div
      className={`square-slot state-${data.state}`}
      onClick={() => props.handleChange(data.x, data.y)}
    >
      <h6>
        {data.x}, {data.y}, index: ({props.item})
      </h6>
      <p>
        {data.knownDistance} + {data.endDistance || "Unknown"}
      </p>
      <p>{data.state}</p>
      <p>
        parent({data.parent?.x}, {data.parent?.y})
      </p>
    </div>
  );
}

export default App;
