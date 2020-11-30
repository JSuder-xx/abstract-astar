const parent = (i: number) => Math.floor((i - 1) / 2);
const left = (i: number) => 2 * i + 1;
const right = (i: number) => 2 * i + 2;

export class MinHeap<Item> {
  private readonly _heapArray: Item[] = [];
  private readonly _itemToIndex = new Map<Item, number>();

  constructor(private _getValue: (item: Item) => number) {}

  public upsert(item: Item): void {
    const existingIndex = this._itemToIndex.get(item);
    if (existingIndex !== undefined) this._heapifyDownFromIndex(existingIndex);
    else this.insert(item);
  }

  public contains(item: Item): boolean {
    return this._itemToIndex.get(item) !== undefined;
  }

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

export function aStar<Node>({
  start,
  goal,
  estimateFromNodeToGoal,
  neighborsAdjacentToNode,
  actualCostToMove: costToMove,
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
        costToMove(cameFromMap, current, neighbor);
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
