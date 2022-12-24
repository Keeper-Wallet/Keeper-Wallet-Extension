# Keeper Wallet Extension Tests

## Setup test environment

First of all, you must have built extension in `dist` folder. Run
`yarn run dev` (development mode) or `yarn run build` (production mode) to
achieve that.

Then, you need to start test environment using docker compose:

```sh
docker compose up waves-private-node chrome --wait
```

Or, if you're developing on an arm-based CPU, like Apple M1/M2, use this command
instead:

```sh
docker compose -f docker-compose.yml -f docker-compose.arm.yml up waves-private-node chrome --wait
```

## Start test runner

Start test runner in watch mode + debugging support:

```sh
yarn run test:dev
```

Now you can edit tests or sources and tests will rerun.

## Teardown test environment

Once you're done, you'll probably want to teardown test environment:

```sh
docker compose down
```
