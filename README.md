# Idleforces

This is a silly game inspired by competitive programming. You take on a role of an aspiring yet terrible competitive programmer. By training persistently, you can bring them to the path towards greatness.

The app is hosted at Netlify using the domain <https://idleforces.netlify.app>.

## Features

- Simulate a contest to unlock more problems to solve.
- Participate in a contest to show off your skills.
- Train on real problems from previous contests.
- Read informative books to acquire skills.
- Get a job that pays a fat paycheck. (currently just an idea, probably gonna be hard to balance or unfun or something inbetween)
- Buy cool perks and upgrades. (just an idea, would require an economy that would be a whole new project with fun absolutely not guaranteed).
- Watch detailed stats and see yourself improve.

## Dev setup

- First, install necessary packages:

```bash
npm install
```

- Run the development server:

```bash
npm run dev
```

- Create a local .env file with the following boolean variable. Check out `/test/probabilistic-assert.ts` for usage:

```bash
VITE_weak=true
```

- Get dependency cruiser output in an eslint format:

```bash
npx depcruise --config .dependency-cruiser.cjs src
```

- Get dependency graph visualized as svg:

```bash
npx depcruise src --include-only "^src" --config --output-type dot | dot -T svg > dependency-graph.svg
```
