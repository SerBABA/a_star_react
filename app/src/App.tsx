import React, { useState } from "react";
import { NodeClass, getAStarSteps, GridClass, nodeState, Coords } from "./a_star";
import "./App.css";

const A_STAR_UPDATE_MS_DELAY = 45;
const X_SIZE = 5;
const Y_SIZE = 4;

enum changeEnum {
  none = "none",
  target = "target",
  source = "source",
  obstacle = "obstacle",
}

function App() {
  // base grid of the entire background.
  const [grid, setGrid] = useState(new GridClass(X_SIZE, Y_SIZE));
  const [running, setRunning] = useState(false);

  // Keeps the state to show of the grid
  const [gridState, setGridState] = useState(grid.state);

  // Stores the actual coordiantes. unable to force the type sadly :(
  const [sourceCoords, setSourceCoords] = useState({ x: 2, y: 3 });
  const [targetCoords, setTargetCoords] = useState({ x: 3, y: 2 });

  // Stores the source and target nodes
  const sourceNode = grid.getNode(sourceCoords.x, sourceCoords.y);
  const targetNode = grid.getNode(targetCoords.x, targetCoords.y);

  // Used to keep track of the user's decision of what action to perfrom on click of the grid!
  const [selectionType, setSelectionType] = useState(changeEnum.none);

  // Handles the change of the target node.
  const handleChangeEnumAssignment = (x: number, y: number) => {
    // Can't change source, target and obstacles while the A* is running.
    if (running) return;

    let node = grid.getNode(x, y);

    // This ensures the coordinates given for the node actually exist within the grid and we can modify it's parameters
    if (node) {
      switch (selectionType) {
        case changeEnum.target:
          // Prevents assignments of target if it has been assigned to obstacle already!
          if (node.state === nodeState.obstacle) return;

          setTargetCoords({ x, y });
          break;

        case changeEnum.source:
          // Prevents assignments of source if it has been assigned to obstacle already!
          if (node.state === nodeState.obstacle) return;

          setSourceCoords({ x, y });
          break;

        case changeEnum.obstacle:
          // Prevents assignment of source and target nodes to an obstacle
          if (sourceCoords.x === x && sourceCoords.y === y) return;
          if (targetCoords.x === x && targetCoords.y === y) return;

          // This implementes the toggle between Unknown state and the obstacle state when assigning an obstacke.
          let newValue = nodeState.obstacle;
          if (node.state === nodeState.obstacle) {
            newValue = nodeState.unknown;
          }

          // Update the visual aspect
          var gridStateCopy = gridState.slice();
          gridStateCopy[grid.getIndex(x, y)].state = newValue;
          setGridState(gridStateCopy);

          // Update the grid state
          node.state = newValue;
          setGrid(grid);

          break;

        default:
          alert("Select an assignment please!");
      }
    }
  };

  // This runs the software to create the history states.
  const handleRunClick = (sourceNode: NodeClass, targetNode: NodeClass) => {
    // Perfroms the calculations!
    getAStarSteps(grid, sourceNode, targetNode)
      .then((response) => {
        // Prevents the grid from being changed while displaying the visualization!
        setRunning(true);

        // displays the steps of the algorithms with a constant delay
        for (let i = 0; i < response.steps.length + 1; i++) {
          setTimeout(() => {
            // If it is the final step it provides access the actions
            // and displaying whether the algorithm found a path or not!
            if (response.steps.length <= i) {
              setRunning(false);
              if (!response.result) alert("Couldn't find a path from the source to the target!");
            } else {
              // Updates the grid
              setGridState(response.steps[i]);
            }
          }, A_STAR_UPDATE_MS_DELAY * i);
        }
      })
      .catch(() => {
        alert("Something went wrong during the action of getting the steps of the algorithm!");
      });
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
          source={sourceCoords}
          target={targetCoords}
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
  source: Coords;
  target: Coords;
};
enum gridNodeType {
  normal = "normal",
  target = "target",
  source = "source",
}
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
        let gridNodeTypeForNode = gridNodeType.normal;
        if (node.x === props.source.x && node.y === props.source.y) {
          gridNodeTypeForNode = gridNodeType.source;
        } else if (node.x === props.target.x && node.y === props.target.y) {
          gridNodeTypeForNode = gridNodeType.target;
        }
        return (
          <Slot
            data={node}
            key={index}
            index={index}
            handleChange={props.handleChange}
            gridNodeType={gridNodeTypeForNode}
          />
        );
      })}
    </div>
  );
}

// Slot represents a node on a grid.
type slotProps = {
  data: NodeClass;
  index: number;
  handleChange: (x: number, y: number) => void;
  gridNodeType: gridNodeType;
};
function Slot(props: slotProps) {
  const data = props.data;

  return (
    <div
      className={`square-slot state-${data.state} ${props.gridNodeType}-type`}
      onClick={() => props.handleChange(data.x, data.y)}
    >
      <h6>
        {data.x}, {data.y}, index: ({props.index})
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
