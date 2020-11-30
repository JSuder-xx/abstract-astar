import { aStar } from "../src/index";

describe(`AStar on one dimensional number line`, () => {
  function scenario({
    given,
    then,
  }: {
    given: { start: number; goal: number };
    then: number[] | undefined;
  }) {
    describe(`GIVEN start of ${given.start} AND goal of ${given.goal}`, () => {
      it(`THEN expect path of numbers to be ${then}`, () => {
        const actual = aStar({
          start: given.start,
          goal: given.goal,
          actualCostToMove: (_cameFromMap, from, to) => Math.abs(from - to),
          estimateFromNodeToGoal: (current) => Math.abs(given.goal - current),
          neighborsAdjacentToNode: (current) =>
            current > 0 ? [current - 1, current + 1] : [current + 1],
        });
        expect(actual).toStrictEqual(then);
      });
    });
  }

  scenario({
    given: {
      start: 0,
      goal: 0,
    },
    then: [0],
  });

  scenario({
    given: {
      start: 0,
      goal: 1,
    },
    then: [0, 1],
  });

  scenario({
    given: {
      start: 0,
      goal: 5,
    },
    then: [0, 1, 2, 3, 4, 5],
  });

  scenario({
    given: {
      start: 5,
      goal: 3,
    },
    then: [5, 4, 3],
  });
});

const zeroToFour = [0, 1, 2, 3, 4];
const adjOffset = [-1, 0, 1];
type Coord = { x: number; y: number };

const getNeighborsCurried = (map: Coord[][]) => {
  const maxY = map.length - 1;
  const maxX = map[0].length - 1;
  return (coord: Coord) =>
    ([] as Coord[]).concat(
      ...adjOffset.map((_, index) => {
        const y = adjOffset[index] + coord.y;
        return y < 0 || y > maxY
          ? []
          : adjOffset
              .map((colOffset) => ({ x: coord.x + colOffset, y }))
              .filter((it) => it.x >= 0 && it.x <= maxX)
              .map((it) => map[it.y][it.x]);
      })
    );
};
const sqr = (num: number) => num * num;

describe(`AStar with 2D grid`, () => {
  describe(`Given a 5x5 map with no obstacles`, () => {
    const map: Coord[][] = zeroToFour.map((y) =>
      zeroToFour.map((x) => ({ x, y }))
    );
    const getNeighbors = getNeighborsCurried(map);

    function scenario({
      given,
      then,
    }: {
      given: { start: Coord; goal: Coord };
      then: Coord[] | undefined;
    }) {
      describe(`GIVEN start of ${JSON.stringify(
        given.start
      )} AND goal of ${JSON.stringify(given.goal)}`, () => {
        it(`THEN expect path of be ${
          then === undefined
            ? `undefined`
            : then.map((it) => JSON.stringify(it))
        }`, () => {
          const actual = aStar({
            start: given.start,
            goal: given.goal,
            actualCostToMove: (_cameFromMap, from, to) =>
              Math.sqrt(sqr(from.x - to.x) + sqr(from.y - to.y)),
            estimateFromNodeToGoal: (current) =>
              Math.abs(given.goal.x - current.x) +
              Math.abs(given.goal.y - current.y),
            neighborsAdjacentToNode: getNeighbors,
          });
          expect(actual).toStrictEqual(then);
        });
      });
    }

    scenario({
      given: {
        start: map[0][0],
        goal: map[0][0],
      },
      then: [map[0][0]],
    });

    scenario({
      given: {
        start: map[0][0],
        goal: map[0][4],
      },
      then: [map[0][0], map[0][1], map[0][2], map[0][3], map[0][4]],
    });

    scenario({
      given: {
        start: map[0][0],
        goal: map[4][0],
      },
      then: [map[0][0], map[1][0], map[2][0], map[3][0], map[4][0]],
    });

    scenario({
      given: {
        start: map[0][0],
        goal: map[4][4],
      },
      then: [map[0][0], map[1][1], map[2][2], map[3][3], map[4][4]],
    });
  });
});
