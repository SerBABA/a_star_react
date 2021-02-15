import { AssertionError } from "assert";
import React from "react";

// for deep copying the states
const Lodash = require("lodash");

// Differnt states the node can be in.
enum nodeState {
    processed,
    unknown,
    seen,
    obstacle,
    path,
}

// Used to store data about each node.
class Node {
    x: number;
    y: number;
    state: nodeState;
    knownDistance: number;
    parent: Node | null;

    constructor(x: number, y: number) {
        // Position on grid
        this.x = x;
        this.y = y;

        // Defaults for tracking
        this.state = nodeState.unknown;
        this.knownDistance = Number.POSITIVE_INFINITY;
        this.parent = null;
    }
}

// Stores the data about a grid.
class Grid {
    xSize: number;
    ySize: number;
    state: Node[];

    constructor(xSize: number, ySize: number) {
        this.xSize = xSize;
        this.ySize = ySize;

        this.state = this.createDefaultState();
    }

    // Create and populates a default state to return. This contains all the nodes.
    createDefaultState(): Node[] {
        let state = [];

        for (let x = 0; x < this.xSize; x++) {
            for (let y = 0; y < this.ySize; y++) {
                state.push(new Node(x, y));
            }
        }

        return state;
    }

    // Resetting the grid elements to unknown when they are not unknown or an obstacle.
    resetGridState(): void {
        for (let i = 0; i < this.state.length; i++) {
            if (
                this.state[i].state !== nodeState.unknown ||
                this.state[i].state !== nodeState.obstacle
            )
                this.state[i].state = nodeState.unknown;
        }
    }

    // Get the Node that resides at the x, y coordinates
    getNode(x: number, y: number): Node | null {
        if (this.isInBounds(x, y)) {
            return this.state[x + y * this.xSize];
        } else {
            return null;
        }
    }

    // Returns the distance between two nodes on the grid.
    distanceBetween(node: Node, otherNode: Node) {
        let xDiff = Math.abs(node.x - otherNode.x);
        let yDiff = Math.abs(node.y - otherNode.y);

        if (xDiff === 0 || yDiff === 0) {
            return Math.max(xDiff, yDiff) ** 2;
        } else {
            return xDiff ** 2 + yDiff ** 2;
        }
    }

    // Given x, y coordinates return wether or not the node would be in bounds of the
    // state grid.
    isInBounds(x: number, y: number): boolean {
        return 0 <= x && x < this.xSize && 0 <= y && y < this.ySize;
    }
}

// Gets the minimum node
function getMinimumNode(nodes: Node[]) {
    let minNode: Node | null = null;
    let minDistance: number = Number.POSITIVE_INFINITY;

    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].knownDistance < minDistance && nodes[i].state === nodeState.seen) {
            minNode = nodes[i];
            minDistance = nodes[i].knownDistance;
        }
    }

    return minNode;
}

// iterates over the neighbours of the current node and returns them (within bounds of the grid).
function getNeighbours(grid: Grid, currNode: Node) {
    let neighbours: Node[] = [];

    // check in bounds for each neighbour (only add valid / in bound ones).
    // check that they are not an obstacle or processed.

    return neighbours;
}

// Adds a new entry into the state history of the A* steps
function addNewStateEntry(stateHistory: Node[][], newState: Node[]) {
    stateHistory.push(Lodash.cloneDeep(newState));
}

// Generates the steps to present to generate the A* algorithm steps
async function getAStarSteps(grid: Grid, source: Node, target: Node): Promise<Node[][]> {
    // ensure we have a consistent start state if it is re-run
    await grid.resetGridState();

    // initialize the source node.
    let sourceNode = grid.getNode(source.x, source.y);
    if (sourceNode) {
        sourceNode.state = nodeState.seen;
        sourceNode.knownDistance = 0;
    } else {
        throw new AssertionError({ message: "Missing start Node" });
    }

    // Create a empty steps list (list of grid states).
    let stateHistory: Node[][] = [];
    addNewStateEntry(stateHistory, grid.state);

    let minNode = getMinimumNode(grid.state);
    // start main loop
    while (minNode !== null || minNode !== target) {
        if (minNode) {
            // mark min node as processed + add a step to the steps
            minNode.state = nodeState.processed;
            addNewStateEntry(stateHistory, grid.state);

            // check all neighbours for shorter paths for them.
            let neighbours = await getNeighbours(grid, minNode);

            // Update their distance based on knwon_distance_from_start + distance_from_end (A*).
            // + add step to the steps for each neighbour changed / visited.
            for (let i = 0; i < neighbours.length; i++) {
                let currNeighbour = neighbours[i];

                // change node state to seen if unknown.
                if (currNeighbour.state === nodeState.unknown) currNeighbour.state = nodeState.seen;

                // check distance vector
                let nodes_distance = grid.distanceBetween(minNode, currNeighbour);
                if (currNeighbour.knownDistance > minNode.knownDistance + nodes_distance) {
                    // update current neighbour.
                    currNeighbour.knownDistance = nodes_distance;
                    currNeighbour.parent = minNode;
                }

                // add step to history.
                addNewStateEntry(stateHistory, grid.state);
            }

            // generate the final path + step for each path node.

            // get min node again
        }
    }

    return stateHistory;
}
