import React, { useState } from "react";
import { NodeClass, getAStarSteps, GridClass } from "./a_star";
import "./App.css";

function App() {
    // base grid of the entire background.
    const grid = new GridClass(5, 5);
    const [running, setRunning] = useState(false);

    // change this to modify based on where it is clicked on screen!
    const sourceNode = grid.getNode(1, 1);
    const targetNode = grid.getNode(4, 3);

    // Keeps the state to show of the grid
    const [gridState, setGridState] = useState(grid.state);

    // This runs the software to create the history states.
    const handleRunClick = (sourceNode: NodeClass, targetNode: NodeClass) => {
        getAStarSteps(grid, sourceNode, targetNode)
            .then((stateHistory) => {
                setRunning(true);
                for (let i = 0; i < stateHistory.length; i++) {
                    setTimeout(() => {
                        setGridState(stateHistory[i]);
                        if (i + 1 >= stateHistory.length) setRunning(false);
                    }, 100 * i);
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
                <Grid grid={gridState} xSize={grid.xSize} ySize={grid.ySize}></Grid>
                <button onClick={() => handleRunClick(sourceNode, targetNode)} disabled={running}>
                    run!
                </button>
                <button onClick={handleResetClick} disabled={running}>
                    reset!
                </button>
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
                return <Slot data={node} key={index} item={index} />;
            })}
        </div>
    );
}

// Slot represents a node on a grid.
type slotProps = {
    data: NodeClass;
    item: number;
};
function Slot(props: slotProps) {
    const data = props.data;

    return (
        <div className={`square-slot state-${data.state}`}>
            <h6>
                {data.x}, {data.y}, index: ({props.item})
            </h6>
            <p>{data.knownDistance}</p>
            <p>{data.state}</p>
            <p>
                parent({data.parent?.x}, {data.parent?.y})
            </p>
        </div>
    );
}

export default App;
