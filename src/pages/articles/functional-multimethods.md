<!-- $template:article -->
<!-- $path:/articles/$file -->
<!-- $title:Functional multimethods -->
<!-- $image:/images/beach.jpg -->
<!-- $imageInfo: Photo by Artem Beliaikin (CC) -->
<!-- $date:2021-10-19 -->
<!-- $tags:JavaScript | TypeScript -->

In this article, I will introduce you to the concept of multimethods.

_WORK IN PROGRESS_

# What is a multimethod?

Multimethods are functions with superpowers - they can do all that ordinary functions can do, but additionally:

- can choose proper implementation based on the provided arguments, without explicit conditional logic,
- can be easily extended, without the need to modify the original code,
- allow you to write clean, concise and decoupled code.

---

You can try them via [NPM package](https://www.npmjs.com/package/@arrows/multimethod):

```
npm i @arrows/multimethod
```

Let's look at this code sample:

```js
/* Original Redux code */

function createStore(reducer, preloadedState, enhancer) {
  if (
    (typeof preloadedState === "function" && typeof enhancer === "function") ||
    (typeof enhancer === "function" && typeof arguments[3] === "function")
  ) {
    throw new Error("Several store enhancers")
  }

  if (typeof preloadedState === "function" && typeof enhancer === "undefined") {
    enhancer = preloadedState
    preloadedState = undefined
  }

  if (typeof enhancer !== "undefined") {
    if (typeof enhancer !== "function") {
      throw new Error(`Expected the enhancer to be a function.`)
    }

    return enhancer(createStore)(reducer, preloadedState)
  }

  if (typeof reducer !== "function") {
    throw new Error(`Expected the root reducer to be a function.`)
  }

  // Store creation code...
}

export default createStore
```

```js
import { multi, method, _ } from "@arrows/multimethod"
import { not, notIn } from "./predicates.js"

/* Direct translation */

const createStore = multi(
  (...args) => args.slice(0, 4).map((arg) => typeof arg),

  method([_, "function", "function", _], () => {
    throw new Error("Several store enhancers")
  }),

  method([_, _, "function", "function"], () => {
    throw new Error("Several store enhancers")
  }),

  method([_, _, notIn("function", undefined), _], () => {
    throw new Error(`Expected the enhancer to be a function.`)
  }),

  method([_, "function", _, _], (reducer, enhancer) => {
    return enhancer(createStore)(reducer)
  }),

  method([_, _, "function", _], (reducer, preloadedState, enhancer) => {
    return enhancer(createStore)(reducer, preloadedState)
  }),

  method([not("function"), _, _, _], () => {
    throw new Error(`Expected the root reducer to be a function.`)
  }),

  method((reducer, preloadedState) => {
    // Store creation code...
  }),
)

export default createStore
```

```js
import { multi, method, _ } from "@arrows/multimethod"
import { getType, types } from "@arrows/dispatch"
import { not, notIn } from "./predicates.js"

/* More elegant version with dispatch utils and separate functions */

const createStore = multi(
  (...args) => args.slice(0, 4).map(getType),

  method([_, types.Function, types.Function, _], handleEnhancersError),

  method([_, _, types.Function, types.Function], handleEnhancersError),

  method([_, _, notIn(types.Function, undefined), _], () => {
    throw new Error(`Expected the enhancer to be a function.`)
  }),

  method([_, types.Function, _, _], (reducer, enhancer) => {
    return enhancer(createStore)(reducer)
  }),

  method([_, _, types.Function, _], (reducer, preloadedState, enhancer) => {
    return enhancer(createStore)(reducer, preloadedState)
  }),

  method([not(types.Function), _, _, _], () => {
    throw new Error(`Expected the root reducer to be a function.`)
  }),

  method(create),
)

function handleEnhancersError() {
  throw new Error("Several store enhancers")
}

function create(reducer, preloadedState) {
  // Store creation code...
}

export default createStore
```

```js
// predicates.js

export const not = (y) => (x) => x !== y
export const notIn =
  (...arr) =>
  (x) =>
    !arr.includes(x)
```

```js
import { multi, method } from "@arrows/multimethod"

/* With custom dispatch per method */

const createStore = multi(
  method(
    (a, b, c, d) =>
      (typeof b === "function" && typeof c === "function") ||
      (typeof c === "function" && typeof d === "function"),
    () => {
      throw new Error("Several store enhancers")
    },
  ),

  method(
    (a, b, c) => c !== undefined && typeof c !== "function",
    () => {
      throw new Error(`Expected the enhancer to be a function.`)
    },
  ),

  method(
    (a, b) => typeof b === "function",
    (reducer, enhancer) => {
      return enhancer(createStore)(reducer)
    },
  ),

  method(
    (a, b, c) => typeof c === "function",
    (reducer, preloadedState, enhancer) => {
      return enhancer(createStore)(reducer, preloadedState)
    },
  ),

  method(
    (a) => typeof a !== "function",
    () => {
      throw new Error(`Expected the root reducer to be a function.`)
    },
  ),

  method((reducer, preloadedState) => {
    // Store creation code...
  }),
)

export default createStore
```
