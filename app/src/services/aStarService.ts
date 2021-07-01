import { ElementStatus, PathAlgorithm } from "./pathAlgoirthm";

/**
 * Performs the A* search algorithm
 */
export class AStarService extends PathAlgorithm {
  private _states = [];
  private _distances = Array(this.getXSize() * this.getYSize()).fill(Number.POSITIVE_INFINITY);

  public async initAlgorithm(): Promise<void> {
    this._states = [];
    this.resetGrid();
  }

  public async runAlgorithm(): Promise<ElementStatus[][]> {
    await this.initAlgorithm();
    return this._states;
  }
}
