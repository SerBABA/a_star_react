export enum ElementStatus {
  UNKNOWN = "unknown",
  SEEN = "seen",
  PROCESSED = "processed",
  OBSTACLE = "obstacle",
  PATH = "path",
}

export abstract class PathAlgorithm {
  /**
   * Contains all the states of all nodes in a single dimension array
   */
  private _grid: ElementStatus[] = [];

  /**
   * Stores the start coordinates
   */
  private _start: number = 0;

  /**
   * Stores the target coordinates
   */
  private _target: number = 0;

  /**
   * Determines the size of the grid in the x-direction
   */
  private _xSize: number = 1;

  /**
   * Determines the size of the grid in the y-direction
   */
  private _ySize: number = 1;

  /**
   * Resets the grid and prepares the algorithm for a new execution cycle.
   */
  public abstract initAlgorithm(): Promise<void>;

  /**
   * Runs the algorithm
   *
   * @return the different states of the algorithm in a list of states
   */
  public abstract runAlgorithm(): Promise<{
    states: (readonly ElementStatus[])[];
    success: boolean;
  }>;

  /**
   * Resets all the grid values to UNKNOWN type.
   */
  public async resetGrid(): Promise<void> {
    this._grid = Array(this._xSize * this._ySize).fill(ElementStatus.UNKNOWN);
    this._grid[this._start] = ElementStatus.SEEN;
  }

  /**
   * Sets the grid element
   *
   * @param grid The new grid element
   * @param index index of the element.
   */
  public async setGridElement(value: ElementStatus, index: number) {
    this._grid[index] = value;
  }

  /**
   * Returns the grid property asynchrounously
   *
   * @param index index of the element.
   * @returns grid property
   */
  public async getGridElement(index: number): Promise<ElementStatus> {
    return this._grid[index];
  }

  /**
   * Get all the valid neighbour indexs for a given index.
   *
   * @param index An index we want its neighbours
   * @returns {Promise<number[]>} All valid neighbour indexs of a given index.
   */
  public async getNeighbours(index: number): Promise<number[]> {
    let neighbours: number[] = [index - this._xSize, index + this._xSize];

    // Only add the neighbours to the right if we are not on the most right column
    if (index % this._xSize < this._xSize - 1) {
      neighbours.concat([index + this._xSize + 1, index + 1, index - this._xSize + 1]);
    }

    // Only add the neighbours to the left if we are not on the most left column
    if (index % this._xSize > 0) {
      neighbours.concat([index - this._xSize - 1, index - 1, index + this._xSize - 1]);
    }

    // Filter any neighbours that are out of the y-axis bounds
    neighbours.filter((val) => val >= 0 && val <= this._xSize * this._ySize);

    // All new neighbours get updated
    for (let i of neighbours) {
      if ((await this.getGridElement(i)) === ElementStatus.UNKNOWN) {
        this.setGridElement(ElementStatus.SEEN, i);
      }
    }

    return neighbours.filter(async (i) => (await this.getGridElement(i)) === ElementStatus.SEEN);
  }

  /**
   * Calculates the distance between two given elements.
   *
   * @param from index of the from element.
   * @param to index of the to element.
   * @returns the distance between the from and to elements.
   */
  public async getDistanceBetweenElements(from: number, to: number): Promise<number> {
    const xDis = Math.abs(from - to) % this._xSize;
    const yDis = Math.abs(Math.floor(from / this._xSize) - Math.floor(to / this._xSize));
    return Math.sqrt(xDis ** 2 + yDis ** 2);
  }

  public getXSize() {
    return this._xSize;
  }

  public getYSize() {
    return this._ySize;
  }

  public getStart() {
    return this._start;
  }

  public getTarget() {
    return this._target;
  }

  public getGrid() {
    return Object.freeze(this._grid.slice());
  }

  public setGridSize(x: number, y: number) {
    this._xSize = x;
    this._ySize = y;
  }
}
