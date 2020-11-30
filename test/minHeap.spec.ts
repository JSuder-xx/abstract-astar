import { MinHeap } from "../src/index";
describe("Given an empty heap", () => {
  //----------------------------------------------------------------------
  // Test phrases
  //----------------------------------------------------------------------
  let heap: MinHeap<number>;

  const removeMinimumReturns = (expected: number | undefined) => {
    it(`removeMinimum returns ${expected}`, () => {
      expect(heap.removeMinimum()).toBe(expected);
    });
  };

  const containsReturns = (num: number, expected: boolean) => {
    it(`contains ${num} returns ${expect}`, () => {
      expect(heap.contains(num)).toBe(expected);
    });
  };

  const whenInserting = (num: number, then: () => void) => {
    describe(`when inserting ${num}`, () => {
      beforeEach(() => {
        heap.insert(num);
      });

      then();
    });
  };

  const whenRemoving = (then: () => void) => {
    describe(`when removing`, () => {
      beforeEach(() => {
        heap.removeMinimum();
      });

      then();
    });
  };

  //----------------------------------------------------------------------
  //----------------------------------------------------------------------

  beforeEach(() => {
    heap = new MinHeap<number>((value) => value);
  });

  containsReturns(1, false);
  containsReturns(3, false);
  containsReturns(5, false);
  removeMinimumReturns(undefined);

  whenInserting(5, () => {
    containsReturns(1, false);
    containsReturns(3, false);
    containsReturns(5, true);

    removeMinimumReturns(5);
    whenRemoving(() => {
      removeMinimumReturns(undefined);
    });

    whenInserting(1, () => {
      containsReturns(1, true);
      containsReturns(3, false);
      containsReturns(5, true);

      removeMinimumReturns(1);
      whenRemoving(() => {
        removeMinimumReturns(5);
      });

      whenInserting(3, () => {
        containsReturns(1, true);
        containsReturns(3, true);
        containsReturns(5, true);

        removeMinimumReturns(1);
        whenRemoving(() => {
          removeMinimumReturns(3);
          whenRemoving(() => {
            removeMinimumReturns(5);
            whenRemoving(() => {
              containsReturns(1, false);
              containsReturns(3, false);
              containsReturns(5, false);

              removeMinimumReturns(undefined);
            });
          });
        });
      });
    });
  });
});
