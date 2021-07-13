import { ElementStatus, PathAlgorithm } from "./pathAlgoirthm";

const WEIGHT_BIAS = 1.5;

/**
 * Performs the A* search algorithm
 */
export class AStarService extends PathAlgorithm {
  /**
   * Stores all the states, which store the "frames" in the algorithm steps
   */
  private _history: (readonly ElementStatus[])[] = [];

  /**
   * Contains the (global) distances for each element from the target element.
   */
  private _heuristic: number[] = Array(this.getXSize() * this.getYSize()).fill(
    Number.POSITIVE_INFINITY
  );

  /**
   * Contains all the distances from the start element (known).
   */
  private _distance: number[] = Array(this.getXSize() * this.getYSize()).fill(
    Number.POSITIVE_INFINITY
  );

  /**
   * Contains all parents of each element
   */
  private _parents: number[] = Array(this.getXSize() * this.getYSize()).fill(null);

  public async initAlgorithm(): Promise<void> {
    this._history = [];
    this.resetGrid();
    this._heuristic = Array(this.getXSize() * this.getYSize()).fill(Number.POSITIVE_INFINITY);
    this._distance = Array(this.getXSize() * this.getYSize()).fill(Number.POSITIVE_INFINITY);
    this._parents = Array(this.getXSize() * this.getYSize()).fill(null);
  }

  /**
   * Given an index get the elements distance from the end
   *
   * @param index The element's index
   * @returns the weight value
   */
  public async getHeuristicWeight(index: number): Promise<number> {
    // If the value is not set we lazily load it
    if (this._heuristic[index] === Number.POSITIVE_INFINITY) {
      this._heuristic[index] = await this.getDistanceBetweenElements(index, this.getTarget());
    }

    return this._heuristic[index] * WEIGHT_BIAS;
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
      let currentDistance = (await this.getHeuristicWeight(i)) + this._distance[i];
      if (currentDistance < minDistance && this.getGridElement(i) === ElementStatus.SEEN) {
        minDistance = currentDistance;
        minIndex = i;
      }
      console.log(
        `minIndex: ${minIndex},:${minDistance}, currIndex: ${i}, ${currentDistance}, ${this.getGridElement(
          i
        )}`
      );
    }
    return minIndex;
  }

  /**
   * Checks the current state to test if the algorithm has reached its goal or cannot proceed any further.
   *
   * @returns True if the algorithm has tried all at can or reached the target. Otherwise false.
   */
  private async isAlgorithmComplete(): Promise<boolean> {
    const alreadyThere: boolean = this.getStart() === this.getTarget();
    const targetStatus: ElementStatus = this.getGridElement(this.getTarget());
    const arrived: boolean = targetStatus === ElementStatus.PROCESSED;
    return alreadyThere || arrived;
  }

  /**
   * Get the current known weight of an element.
   *
   * @param index Index of the element we want it's weight
   * @returns
   */
  private async getElementWeight(index: number) {
    return (await this.getHeuristicWeight(index)) + this._distance[index];
  }

  /**
   * Given the detour route through a detour element
   *
   * @param index Index of the element we want to get's it detour route weight
   * @param detour Detour index of the element we detouring through
   * @returns Weight of the detour route
   */
  private async getDetourWeight(index: number, detour: number) {
    const neighDistance: number = await this.getDistanceBetweenElements(detour, index);
    return this._distance[detour] + neighDistance + (await this.getHeuristicWeight(index));
  }

  public async runAlgorithm() {
    await this.initAlgorithm();
    this.setGridElement(ElementStatus.SEEN, this.getStart()); // Remoeved this section from the initAlgorithm() to prevent artifacts
    this._distance[this.getStart()] = 0; //                      between resets.
    this.takeGridSnapshot();

    let minElement = await this.getMinimumElement();

    // Removed minElement check from the algorithmComplete() because of Typescript saying that it will allow null values...
    while (!(await this.isAlgorithmComplete()) && minElement !== null) {
      // Inform that we are current processing the current minimum element
      this.setGridElement(ElementStatus.PROCESSING, minElement);
      this.takeGridSnapshot();

      // Test all the neighbours to see if the need updating
      for (let neighbourIndex of await this.getNeighbours(minElement)) {
        // If we haven't seen this element before we mark it as SEEN
        if (this.getGridElement(neighbourIndex) === ElementStatus.UNKNOWN) {
          this.setGridElement(ElementStatus.SEEN, neighbourIndex);
        }

        const neighbourDistance = await this.getDistanceBetweenElements(minElement, neighbourIndex);

        // Get the new optional route for a neighbour
        const detourWeight = await this.getDetourWeight(neighbourIndex, minElement);

        // Get the current shortest distance known for the neighbour
        const currentWeight = await this.getElementWeight(neighbourIndex);

        // Update the neighbour's route if the new route offered is shorter
        if (detourWeight < currentWeight) {
          this._distance[neighbourIndex] = this._distance[minElement] + neighbourDistance;
          this._parents[neighbourIndex] = minElement;
        }

        this.takeGridSnapshot();
      }

      this.setGridElement(ElementStatus.PROCESSED, minElement);
      this.takeGridSnapshot();

      // // If we processed the target element we stop the loop. Otherwise we continue
      minElement = await this.getMinimumElement();
    }

    // Record the final path
    const success = await this.recordPath(minElement);

    return { states: this._history, success };
  }

  /**
   * Given an element it will try and trace back a path through the _parents array to the start element.
   *
   * @param sourceElement Defines the start point of the path algorithm
   * @returns true if it managed to find a path to the start element otherwise false.
   */
  private async recordPath(sourceElement: number | null): Promise<boolean> {
    if (sourceElement !== null) {
      let currElement = this.getTarget();
      let nextElement = this._parents[this.getTarget()];

      while (nextElement !== currElement && this._parents[currElement] !== null) {
        if (currElement) this.setGridElement(ElementStatus.PATH, currElement);
        currElement = nextElement;
        if (nextElement) nextElement = this._parents[nextElement];
        this.takeGridSnapshot();
      }

      this.setGridElement(ElementStatus.PATH, currElement);
      this.takeGridSnapshot();

      return currElement === this.getStart();
    }
    return false;
  }

  /**
   * Stores the current grid states into the history.
   */
  private takeGridSnapshot() {
    this._history.push(this.getGrid());
  }
}
