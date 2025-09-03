# App _2025_

_This repository contains the **frontend**._

It's an [Angular](https://angular.dev/) project that is served by the [app-server](https://github.com/giuliano-marinelli/app-server) via [Express](https://expressjs.com). It uses [Angular Material](https://material.angular.dev/) for UI components and [Tailwind](https://tailwindcss.com/) for utility-first styling, and [GraphQL](https://graphql.org/) + [Apollo](https://www.apollographql.com/) for query the application endpoints.

Additionally, it uses [Apollo Dynamic](https://github.com/giuliano-marinelli/apollo-dynamic) + [Apollo Dynamic Angular](https://github.com/giuliano-marinelli/apollo-dynamic-angular) for dynamic GraphQL queries and mutations.

## Setup

1. Install [Node.js](https://nodejs.org)
2. Install [Angular CLI](https://angular.dev/tools/cli): `npm install -g @angular/cli`
3. From project root folder install all the dependencies: `npm install`
4. To be served by [app-server](https://github.com/giuliano-marinelli/app-server), it must be located at sibling folder of this project, as shown:

```
app
└─ app-client
└─ app-server
   └─ uploads (this is where server saves users uploaded files)
```

## Run

### Development

Run `npm run start`: execute [ng serve](https://angular.dev/cli/serve) that makes a virtual server on memory and host Angular page at [localhost:4200](http://localhost:4200). Any change automatically creates a new bundle. _(**Note:** with this command you will not be able to do queries to [app-server](https://github.com/giuliano-marinelli/app-server) because this won't generate **dist** folder to be served by [app-server](https://github.com/giuliano-marinelli/app-server) and so the projects will not be at same path)_

Run `npm run build:dev` or `npm run build:watch`: execute [ng build](https://angular.dev/cli/build) with development environment and watch mode (if corresponding command is used), it compiles to **dist** folder at the project root folder. You also need to execute [app-server](https://github.com/giuliano-marinelli/app-server) for see Angular page hosted by it at [localhost:3000](http://localhost:3000). Any change on source code automatically creates a new bundle if in watch mode.

### Production

Run `npm run build:prod`: executes [ng build](https://angular.dev/cli/build) with production environment, it compiles to **dist** folder at the project root folder. Then it can be served by [app-server](https://github.com/giuliano-marinelli/app-server), in the same way as the development build.

### Format and Lint

Run `npm run format`: formats the code using [Prettier](https://prettier.io/), which enforces a consistent style.

Run `npm run lint`: runs [ESLint](https://eslint.org/) to lint the code, for catching potential errors and enforcing coding standards.

Run `npm run lint:fix`: runs [ESLint](https://eslint.org/) to lint the code, and automatically fix linting errors and warnings.

### Test

Run `npm run test` or `npm run test:watch`: executes [ng test](https://angular.dev/guide/testing) to run the unit tests in watch mode (if corresponding command is used) using [Karma](https://karma-runner.github.io) as the test runner and [Jasmine](https://jasmine.github.io/) as the testing framework. Any change on source code automatically creates a new bundle if in watch mode.

Run `npm run test:cov`: executes [ng test](https://angular.dev/guide/testing/code-coverage) to run the unit tests and generate a code coverage report.

Run `npm run test:e2e`: executes [ng e2e](https://angular.dev/tools/cli/end-to-end) to run the end-to-end tests.
