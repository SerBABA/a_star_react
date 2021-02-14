import React from "react";

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
        if (
            nodes[i].knownDistance < minDistance &&
            nodes[i].state === nodeState.seen
        ) {
            minNode = nodes[i];
            minDistance = nodes[i].knownDistance;
        }
    }

    return minNode;
}

// Generates the steps to present to generate the A* algorithm steps
async function getAStarSteps(grid: Grid, source: Node, target: Node) {
    await grid.resetGridState();
}
