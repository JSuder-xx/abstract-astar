const parent = (index: number) => Math.floor((index - 1) / 2);
const left = (index: number) => 2 * index + 1;
const right = (index: number) => 2 * index + 2;

/**
 * A minimum-heap data structure ideal for the use case where
 * - there are many writes relative to reads.
 * - the only access requirement is to retrieve the item with the lowest value.
 */
export class MinHeap<Item> {
  private readonly _heapArray: Item[] = [];
  private readonly _itemToIndex = new Map<Item, number>();

  constructor(
    /** The scoring function which is used to order the item on the heap. */ private _getValue: (
      item: Item
    ) => number
  ) {}

  /**
   * - If the item is not already present then insert
   * - Otherwise re-balance the item
   *
   * Cost of O(log n).
   **/
  public upsert(item: Item): void {
    const existingIndex = this._itemToIndex.get(item);
    if (existingIndex !== undefined) this._heapifyDownFromIndex(existingIndex);
    else this.insert(item);
  }

  /**
   * Returns true if the item is present in the heap.
   *
   * Cost of O(1) using Hash map.
   */
  public contains(item: Item): boolean {
    return this._itemToIndex.get(item) !== undefined;
  }

  /**
   * Inserts the item into the heap. It does not check for existence so it is possible to add duplicate entries through this method.
   *
   * Cost of O(log n).
   */
  public insert(item: Item): void {
    const { _getValue, _heapArray, _itemToIndex } = this;

    // add to the end
    _heapArray.push(item);
    let index = this._heapArray.length - 1;
    _itemToIndex.set(item, index);

    // swap it up the heap until the invariant condition restored
    while (index !== 0) {
      const parentIndex = parent(index);
      const parentItem = _heapArray[parentIndex];
      if (_getValue(parentItem) <= _getValue(_heapArray[index])) return;

      this._swapIndexes(index, parentIndex);
      index = parentIndex;
    }
  }

  /**
   * Removes the minimum item (top) from the heap.
   *
   * Cost O(log n)
   */
  public removeMinimum(): Item | undefined {
    const { _heapArray, _itemToIndex } = this;
    if (_heapArray.length <= 0) return undefined;
    if (_heapArray.length === 1) {
      _itemToIndex.delete(_heapArray[0]);
      return _heapArray.pop();
    }

    const root = _heapArray[0];
    _itemToIndex.delete(root);

    // put the last item in the first position and restore invariant
    _heapArray[0] = _heapArray.pop()!;
    this._heapifyDownFromIndex(0);

    return root;
  }

  private _swapIndexes(firstIndex: number, secondIndex: number) {
    const { _heapArray, _itemToIndex } = this;

    const firstItem = _heapArray[firstIndex];
    const secondItem = _heapArray[secondIndex];
    _itemToIndex.set(firstItem, secondIndex);
    _itemToIndex.set(secondItem, firstIndex);
    _heapArray[firstIndex] = secondItem;
    _heapArray[secondIndex] = firstItem;
  }

  /** Recursively ensures the item at the given index is less than its children. */
  private _heapifyDownFromIndex(index: number) {
    const { _heapArray, _getValue } = this;

    const leftIndex = left(index);
    const rightIndex = right(index);
    let smallestIndex = index;
    const size = _heapArray.length;
    if (
      leftIndex < size &&
      _getValue(_heapArray[leftIndex]) < _getValue(_heapArray[index])
    )
      smallestIndex = leftIndex;
    if (
      rightIndex < size &&
      _getValue(_heapArray[rightIndex]) < _getValue(_heapArray[smallestIndex])
    )
      smallestIndex = rightIndex;

    if (smallestIndex !== index) {
      this._swapIndexes(index, smallestIndex);
      this._heapifyDownFromIndex(smallestIndex);
    }
  }
}

/**
 * Returns a single path (or undefined if a path could not be found) from a start to a goal.
 *
 * Makes no assumptions about node structure. Requires injection of functions which return the needed information.
 *
 * **⛔PERFORMANCE NOTE** You may wish to use memoization to cache results of functions such as neighborsAdjacentToNode if
 * those functions are referentially transparent i.e. the result is always the same for the same inputs.
 */
export function aStar<Node>({
  start,
  goal,
  estimateFromNodeToGoal,
  neighborsAdjacentToNode,
  actualCostToMove,
}: {
  start: Node;
  goal: Node;
  /** Provide an estimate from the given node to the goal. */
  estimateFromNodeToGoal: (node: Node) => number;
  neighborsAdjacentToNode: (node: Node) => Node[];
  actualCostToMove: (
    /** A map from a node to the node before it in the path. This can be used to provide cost based on the shape of paths. */
    cameFromMap: Map<Node, Node>,
    /** We are moving from this node. */
    from: Node,
    /** To this node. */
    to: Node
  ) => number;
}): Node[] | undefined {
  const cameFromMap = new Map<Node, Node>();
  const cheapestActualCostFrom = new Map<Node, number>();
  cheapestActualCostFrom.set(start, 0);
  const cheapestEstimatedCostToGoalFrom = new Map<Node, number>();
  cheapestEstimatedCostToGoalFrom.set(start, estimateFromNodeToGoal(start));

  const openMinHeap = new MinHeap<Node>(
    (node) => cheapestEstimatedCostToGoalFrom.get(node) ?? Infinity
  );
  openMinHeap.upsert(start);

  while (true) {
    const current = openMinHeap.removeMinimum();

    // no more to explore, failed to find path
    if (current === undefined) return undefined;

    // reached goal
    if (current === goal) return reconstructPath(cameFromMap, current);

    const cheapestActualCostToCurrent =
      cheapestActualCostFrom.get(current) ?? Infinity;

    neighborsAdjacentToNode(current).forEach((neighbor) => {
      const actualCostToNeighbor =
        cheapestActualCostToCurrent +
        actualCostToMove(cameFromMap, current, neighbor);
      const cheapestActualCostToNeighbor =
        cheapestActualCostFrom.get(neighbor) ?? Infinity;
      if (actualCostToNeighbor < cheapestActualCostToNeighbor) {
        cameFromMap.set(neighbor, current);
        cheapestActualCostFrom.set(neighbor, actualCostToNeighbor);
        cheapestEstimatedCostToGoalFrom.set(
          neighbor,
          actualCostToNeighbor + estimateFromNodeToGoal(neighbor)
        );

        openMinHeap.upsert(neighbor);
      }
    });
  }
}

function reconstructPath<Node>(
  cameFrom: Map<Node, Node>,
  current: Node
): Node[] {
  const total = [current];
  while (true) {
    const newCurrent = cameFrom.get(current);
    if (newCurrent === undefined) return total.reverse();
    else {
      total.push(newCurrent);
      current = newCurrent;
    }
  }
}
