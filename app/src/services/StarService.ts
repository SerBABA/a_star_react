import { ElementStatus, PathAlgorithm } from "./pathAlgoirthm";

/**
 * Performs the A* search algorithm
 */
export class AStarService extends PathAlgorithm {
  /**
   * Stores all the states, which store the "frames" in the algorithm steps
   */
  private _states: (readonly ElementStatus[])[] = [];

  /**
   * Contains the (global) distances for each element from the target element.
   */
  private _distancesEnd: number[] = Array(this.getXSize() * this.getYSize()).fill(
    Number.POSITIVE_INFINITY
  );

  /**
   * Contains all the distances from the start element (known).
   */
  private _distancesStart: number[] = Array(this.getXSize() * this.getYSize()).fill(
    Number.POSITIVE_INFINITY
  );

  /**
   * Contains all parents of each element
   */
  private _parents: number[] = Array(this.getXSize() * this.getYSize()).fill(Number.NaN);

  public async initAlgorithm(): Promise<void> {
    this._states = [];
    this.resetGrid();
    this._distancesEnd = Array(this.getXSize() * this.getYSize()).fill(Number.POSITIVE_INFINITY);
    this._distancesStart = Array(this.getXSize() * this.getYSize()).fill(Number.POSITIVE_INFINITY);
    this._parents = Array(this.getXSize() * this.getYSize()).fill(Number.NaN);

    this._distancesStart[this.getStart()] = 0;
  }

  /**
   * Given an index get the elements distance from the end
   *
   * @param index The element's index
   * @returns the weight value
   */
  public async getElementEndDistance(index: number): Promise<number> {
    // If the value is not set we lazily load it
    if (this._distancesEnd[index] === Number.POSITIVE_INFINITY) {
      this._distancesEnd[index] = await this.getDistanceBetweenElements(index, this.getTarget());
    }

    return this._distancesEnd[index];
  }

  /**
   * Get the element with the smallest known distance that is in state SEEN.
   *
   * @returns said element's index.
   */
  public async getMinimumElement(): Promise<number | null> {
    let minDistance: number = Number.POSITIVE_INFINITY;
    let minIndex: number | null = null;

    for (let i = 0; i < this.getGrid().length; i++) {
      let currentDistance = (await this.getElementEndDistance(i)) + this._distancesStart[i];
      if (currentDistance < minDistance && this.getGrid()[i] === ElementStatus.SEEN) {
        minDistance = currentDistance;
        minIndex = i;
      }
    }

    return minIndex;
  }

  public async runAlgorithm(): Promise<{
    states: (readonly ElementStatus[])[];
    success: boolean;
  }> {
    // Reseting...
    let success: boolean = true;
    this._states.push(this.getGrid());

    let minElement = await this.getMinimumElement();

    while (minElement !== null) {
      this.setGridElement(ElementStatus.PROCESSING, minElement);
      this._states.push(this.getGrid());
      for (let neighbourIndex of await this.getNeighbours(minElement)) {
        let neighbourDistance: number = await this.getDistanceBetweenElements(
          minElement,
          neighbourIndex
        );

        // New route option
        let newDistance =
          this._distancesStart[minElement] +
          neighbourDistance +
          (await this.getElementEndDistance(neighbourIndex));

        // Current known shortest route
        let currDistance =
          (await this.getElementEndDistance(neighbourIndex)) + this._distancesStart[neighbourIndex];

        // Update the route
        if (newDistance < currDistance) {
          this._distancesStart[neighbourIndex] =
            this._distancesStart[minElement] + neighbourDistance;

          this._parents[neighbourIndex] = minElement;
        }

        this._states.push(this.getGrid());
      }
      this.setGridElement(ElementStatus.PROCESSED, minElement);
      this._states.push(this.getGrid());

      // If we reached the target we stop the loop
      if (minElement === this.getTarget()) break;
      minElement = await this.getMinimumElement();
    }

    if (minElement !== null) {
      let currElement = this.getTarget();
      let nextElement = this._parents[this.getTarget()];

      while (nextElement !== currElement) {
        if (currElement) this.setGridElement(ElementStatus.PATH, currElement);
        currElement = nextElement;
        if (nextElement) nextElement = this._parents[nextElement];
        this._states.push(this.getGrid());
      }

      this.setGridElement(ElementStatus.PATH, currElement);
      this._states.push(this.getGrid());
    } else {
      success = false;
    }

    return { states: this._states, success };
  }
}
