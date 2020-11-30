# Overview

Versatile A\* (A Star) implementation in TypeScript.

It is a bit embarassing to implement this algorithm: I assumed the world did not need another implementation and
that I would be able to use a library for my needs.

However, every implementation I found during a 40 minute search made too many **assumptions** in order to simplify the developer experience. This library makes no assumptions whatsoever
which makes it more adaptable. Reasons you might want to peek into this

- Uses a Min Heap structure for speed.
- All concerns injected into search function.
  - Injected cost function is given the cameFrom map thus supporting incorporating the shape of the path into the cost ex. penalize a path that makes turns.
- Makes no assumptions about the structure or nature of the graph.
- No dependencies on any other libraries (except for unit testing).
