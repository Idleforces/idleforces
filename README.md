# Idleforces

This is a silly game inspired by competitive programming. You take on a role of an aspiring yet terrible competitive programmer. By training persistently, you can bring them to the path towards greatness.

## Features

- Simulate a contest to unlock more problems to solve.
- Participate in a contest to show off your skills.
- Train on real problems from previous contests.
- Get a job that pays a fat paycheck.
- Buy cool perks and upgrades.
- Watch detailed stats and see yourself improve.

## Dev setup

- First, install necessary packages:

```javascript
npm install
```

- Run the development server:

```javascript
npm run dev
```

- Create a local .env file with the following boolean variable. Check out `/test/probabilistic-assert.ts` for usage

```env
VITE_weak=true
```

- Get dependency cruiser output in an eslint format:

```javascript
npx depcruise --config .dependency-cruiser.cjs
```

- Get dependency graph visualized as svg:

```javascript
npx depcruise src --include-only "^src" --config --output-type dot | dot -T svg > dependency-graph.svg
```
