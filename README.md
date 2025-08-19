# CDP Node.js Environment Test Suite Template

The template to create a service that runs WDIO tests against an environment.

- [Local](#local)
  - [Requirements](#requirements)
    - [Node.js](#nodejs)
  - [Setup](#setup)
  - [Running local tests](#running-local-tests)
  - [Debugging local tests](#debugging-local-tests)
- [Production](#production)
  - [Debugging tests](#debugging-tests)
- [Licence](#licence)
  - [About the licence](#about-the-licence)

## Local Development

### Requirements

#### Node.js

Please install [Node.js](http://nodejs.org/) `>= v20` and [npm](https://nodejs.org/) `>= v9`. You will find it
easier to use the Node Version Manager [nvm](https://github.com/creationix/nvm)

To use the correct version of Node.js for this application, via nvm:

```bash
nvm use
```

### Setup

Install application dependencies:

```bash
npm install
```

### Running local tests

Start application you are testing on the url specified in `baseUrl` [wdio.local.conf.js](wdio.local.conf.js)

```bash
npm run test:local
```

### Debugging local tests

```bash
npm run test:local:debug
```

## Production

### Running the tests

Tests are run from the CDP-Portal under the Test Suites section. Before any changes can be run, a new docker image must be built, this will happen automatically when a pull request is merged into the `main` branch.
You can check the progress of the build under the actions section of this repository. Builds typically take around 1-2 minutes.

The results of the test run are made available in the portal.

## Requirements of CDP Environment Tests

1. Your service builds as a docker container using the `.github/workflows/publish.yml`
   The workflow tags the docker images allowing the CDP Portal to identify how the container should be run on the platform.
   It also ensures its published to the correct docker repository.

2. The Dockerfile's entrypoint script should return exit code of 0 if the test suite passes or 1/>0 if it fails

3. Test reports should be published to S3 using the script in `./bin/publish-tests.sh`

## Running on GitHub

Alternatively you can run the test suite as a GitHub workflow.
Test runs on GitHub are not able to connect to the CDP Test environments. Instead, they run the tests agains a version of the services running in docker.
A docker compose `compose.yml` is included as a starting point, which includes the databases (mongodb, redis) and infrastructure (localstack) pre-setup.

Steps:

1. Edit the compose.yml to include your services.
2. Modify the scripts in docker/scripts to pre-populate the database, if required and create any localstack resources.
3. Test the setup locally with `docker compose up` and `npm run test:github`
4. Set up the workflow trigger in `.github/workflows/journey-tests`.

By default, the provided workflow will run when triggered manually from GitHub or when triggered by another workflow.

If you want to use the repository exclusively for running docker composed based test suites consider displaying the publish.yml workflow.

## BrowserStack

Two wdio configuration files are provided to help run the tests using BrowserStack in both a GitHub workflow (`wdio.github.browserstack.conf.js`) and from the CDP Portal (`wdio.browserstack.conf.js`).
They can be run from npm using the `npm run test:browserstack` (for running via portal) and `npm run test:github:browserstack` (from GitHib runner).
See the CDP Documentation for more details.

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government licence v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable
information providers in the public sector to license the use and re-use of their information under a common open
licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
