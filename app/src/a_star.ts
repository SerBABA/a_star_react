import { AssertionError } from "assert";
import React from "react";

// for deep copying the states
const Lodash = require("lodash");

// Differnt states the node can be in.
export enum nodeState {
  processed = "processed",
  unknown = "unknown",
  seen = "seen",
  obstacle = "obstacle",
  path = "path",
}

// coordinates type
export type Coords = {
  x: number;
  y: number;
};

// Used to store data about each node.
export class NodeClass {
  x: number;
  y: number;
  state: nodeState;
  knownDistance: number;
  endDistance: number | null;
  parent: NodeClass | null;

  constructor(x: number, y: number) {
    // Position on grid
    this.x = x;
    this.y = y;

    // Defaults for tracking
    this.state = nodeState.unknown;
    this.knownDistance = Number.POSITIVE_INFINITY;
    this.endDistance = null;
    this.parent = null;
  }
}

// Stores the data about a grid.
export class GridClass {
  xSize: number;
  ySize: number;
  state: NodeClass[];

  constructor(xSize: number, ySize: number) {
    this.xSize = xSize;
    this.ySize = ySize;

    this.state = this.createDefaultState();
  }

  // Create and populates a default state to return. This contains all the nodes.
  createDefaultState(): NodeClass[] {
    let state = [];

    for (let y = 0; y < this.ySize; y++) {
      for (let x = 0; x < this.xSize; x++) {
        state.push(new NodeClass(x, y));
      }
    }

    return state;
  }

  // Resetting the grid elements to unknown when they are not unknown or an obstacle.
  // Returns this original state of the grid
  resetGridState(): NodeClass[] {
    for (let i = 0; i < this.state.length; i++) {
      if (this.state[i].state !== nodeState.unknown && this.state[i].state !== nodeState.obstacle)
        this.state[i].state = nodeState.unknown;
      this.state[i].parent = null;
      this.state[i].knownDistance = Number.POSITIVE_INFINITY;
      this.state[i].endDistance = null;
    }
    return this.state;
  }

  // Returns the index of a node at given coordiantes
  getIndex(x: number, y: number): number {
    return x + y * this.xSize;
  }

  // Get the Node that resides at the x, y coordinates
  getNode(x: number, y: number): NodeClass | null {
    if (this.isInBounds(x, y)) {
      return this.state[this.getIndex(x, y)];
    } else {
      return null;
    }
  }

  // Returns the distance between two nodes on the grid.
  distanceBetween(node: NodeClass, otherNode: NodeClass) {
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
function getMinimumNode(nodes: NodeClass[]) {
  let minNode: NodeClass | null = null;
  let minDistance: number = Number.POSITIVE_INFINITY;

  for (let i = 0; i < nodes.length; i++) {
    let node = nodes[i];

    if (node.endDistance) {
      if (node.knownDistance + node.endDistance < minDistance && node.state === nodeState.seen) {
        minNode = node;
        minDistance = node.knownDistance + node.endDistance;
      }
    } else {
      if (nodes[i].knownDistance < minDistance && node.state === nodeState.seen) {
        minNode = node;
        minDistance = node.knownDistance;
      }
    }
  }

  return minNode;
}

// iterates over the neighbours of the current node and returns them (within bounds of the grid).
function getNeighbours(grid: GridClass, currNode: NodeClass) {
  let neighbours: NodeClass[] = [];

  // neighbour coords depending on the current node coordinates.
  const neighboursCoords: Coords[] = [
    { x: currNode.x + 1, y: currNode.y + 1 },
    { x: currNode.x, y: currNode.y + 1 },
    { x: currNode.x - 1, y: currNode.y + 1 },
    //
    { x: currNode.x + 1, y: currNode.y },
    { x: currNode.x - 1, y: currNode.y },
    //
    { x: currNode.x + 1, y: currNode.y - 1 },
    { x: currNode.x, y: currNode.y - 1 },
    { x: currNode.x - 1, y: currNode.y - 1 },
  ];

  for (let i = 0; i < neighboursCoords.length; i++) {
    let coord = neighboursCoords[i];
    let node = grid.getNode(coord.x, coord.y);

    // if the node is returned it is in bounds
    if (node) {
      // check that they are not an obstacle or processed.
      if (node.state !== nodeState.obstacle && node.state !== nodeState.processed)
        neighbours.push(node);
    }
  }

  return neighbours;
}

// Adds a new entry into the state history of the A* steps
function addNewStateEntry(stateHistory: NodeClass[][], newState: NodeClass[]) {
  stateHistory.push(Lodash.cloneDeep(newState));
}

type promiseAstarSteps = {
  steps: NodeClass[][];
  result: boolean;
};

// Generates the steps to present to generate the A* algorithm steps
export async function getAStarSteps(
  grid: GridClass,
  source: NodeClass,
  target: NodeClass
): Promise<promiseAstarSteps> {
  // ensure we have a consistent start state if it is re-run
  await grid.resetGridState();
  // determines if we have found a path from the target to the start (default yes)
  let foundPath = true;

  // initialize the source node.
  let sourceNode = grid.getNode(source.x, source.y);
  if (sourceNode) {
    sourceNode.state = nodeState.seen;
    sourceNode.knownDistance = 0;
  } else {
    throw new AssertionError({ message: "Missing start Node" });
  }

  // Create a empty steps list (list of grid states).
  let stateHistory: NodeClass[][] = [];
  addNewStateEntry(stateHistory, grid.state);

  let minNode = getMinimumNode(grid.state);
  // start main loop
  while (minNode) {
    // mark min node as processed + add a step to the steps
    minNode.state = await nodeState.processed;
    addNewStateEntry(stateHistory, grid.state);

    // check all neighbours for shorter paths for them.
    let neighbours = await getNeighbours(grid, minNode);

    // Update their distance based on knwon_distance_from_start + distance_from_end (A*).
    // + add step to the steps for each neighbour changed / visited.
    for (let i = 0; i < neighbours.length; i++) {
      let currNeighbour = neighbours[i];

      // change node state to seen if unknown.
      if (currNeighbour.state === nodeState.unknown) currNeighbour.state = nodeState.seen;

      // The distance between the minimum node and the current neighbour
      let neighbourDistance = grid.distanceBetween(minNode, currNeighbour);

      // ensures there is a end distance already calculated
      if (!currNeighbour.endDistance)
        currNeighbour.endDistance = grid.distanceBetween(target, currNeighbour);

      // This is the check for the distance
      if (
        currNeighbour.knownDistance >
        minNode.knownDistance + neighbourDistance + currNeighbour.endDistance
      ) {
        // update current neighbour.
        currNeighbour.knownDistance = minNode.knownDistance + neighbourDistance;
        currNeighbour.parent = minNode;
        // testing
      }
      // add step to history.
      await addNewStateEntry(stateHistory, grid.state);
    }

    // Get new minimum node
    if (minNode.x !== target.x || minNode.y !== target.y) {
      minNode = await getMinimumNode(grid.state);
    } else {
      break;
    }
  }

  // generate the final path + step for each path node.
  if (minNode) {
    let currNode: NodeClass | null = target;
    let nextNode: NodeClass | null = target.parent;

    while (nextNode !== currNode) {
      // trace back... and add states to the history!
      if (currNode) {
        currNode.state = nodeState.path;
      }

      currNode = nextNode;
      if (nextNode) {
        nextNode = nextNode.parent;
      }
      addNewStateEntry(stateHistory, grid.state);
    }
  } else {
    foundPath = false;
  }

  return { steps: stateHistory, result: foundPath };
}
