## epr-backend-journey-tests

Test suite that runs a set of end to end tests against the [epr-backend](https://github.com/DEFRA/epr-backend) service.

Also provides a data generator facility for local development purposes.

- [Local](#local)
  - [Requirements](#requirements)
    - [Node.js](#nodejs)
  - [Setup](#setup)
  - [Running local tests](#running-local-tests)
  - [Running with Proxy](#running-with-proxy)
  - [Running the tests on environments](#running-the-tests-on-environments)
  - [Running the tests against environments locally](#running-the-tests-against-environments-locally)
  - [Running the data generator for epr-backend](#running-the-data-generator-for-epr-backend)
- [What is tested in this test suite](#what-is-tested-in-this-test-suite)
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

Bring up the relevant Docker containers:

```bash
docker compose up -d
```

Run the tests:

```bash
npm run test
```

If you run the `epr-backend` service as a standalone service (not via Docker Compose) and you wish to test without the logs or audit logs, run the following command:

```bash
WITHOUT_LOGS=true npm run test
```

The testing of logs and audit logs also assumes that you have run the Docker compose command above as it relies on the Dockerised `epr-backend` service.

### Running tests with tags

For example, if you want to run accreditation tests, you can invoke:

```bash
npm run test:tagged @accreditation
```

To run with report, you can invoke:

```bash
npm run test:tagged @accreditation && npm run report
```

### Running with Proxy

By default, Proxy is disabled. To enable it, you first need a Proxy server running. You can use MITM Proxy via this Docker container command:

```
docker run --rm -it --name mitm-proxy --network cdp-tenant -p 7777:7777 -p 127.0.0.1:8081:8081 mitmproxy/mitmproxy mitmweb --web-host 0.0.0.0 --listen-port 7777 --set block_global=false
```

You can now monitor the proxy traffic via http://localhost:8081/ (Use the token on the console output from the Docker command above)

If you wish to use a port number other than 8081 for MITM Proxy (Web), you can pass in the following option at the end of the docker command (e.g. port 8082):

```
--web-port 8082
```

Now, you can run the tests with the following command:

```
WITH_PROXY=true npm run test
```

### Running with a non Docker based Proxy

Alternatively, you can also use a non Docker based Proxy client such as Postman. For more information, please refer to the [Postman Docs](https://learning.postman.com/docs/sending-requests/capturing-request-data/capture-with-proxy/).

To run a non Docker based Proxy client, you need to use the following command:

```
WITH_EXTERNAL_PROXY=true npm run test
```

The default Proxy port is 7777. You can change it by modifying the value in `test/config/config.js` under the ProxyAgent configuration.

### Running the tests on environments

Tests are run from the CDP-Portal under the Test Suites section. Before any changes can be run, a new docker image must be built, this will happen automatically when a pull request is merged into the `main` branch.
You can check the progress of the build under the actions section of this repository. Builds typically take around 1-2 minutes.

The results of the test run are made available in the portal.

### Running the tests against environments locally

You can also run the tests against environments locally. This can be achieved by supplying the ENVIRONMENT variable.

Ensure ZAP docker container is running and the proxy of your choice is running.

```
docker compose up -d zap
```

Then, to run the tests against the `dev` environment:

```
ENVIRONMENT=dev npm run test
```

If you want to run the tests with proxy against the `dev` environment, you can do so by supplying the following:

```
WITH_PROXY=true ENVIRONMENT=dev npm run test
```

Note that the database checks and logging tests will not run against the `dev` environment as they rely on the local Docker services.

### Running the data generator for epr-backend

This only applies to local builds. You can generate 50 organisation details, registrations and accreditations (all linked together) in one go with this command:

```
npm run generatedata
```

This will create mock datasets for the 3 collections in the database. Only to be used for local development purposes.

## What is tested in this test suite

| Test type               | Local / PR Checks | Dev environment | Test environment |
| ----------------------- | ----------------- | --------------- | ---------------- |
| Endpoint tests          | &check;           | &check;         | &check;          |
| Mongo / database checks | &check;           | &#x2612;        | &#x2612;         |
| Logging tests           | &check;           | &#x2612;        | &#x2612;         |
| ZAP tests               | &check;           | &check;         | &check;          |
| Email / Notify tests    | &#x2612;          | &#x2612;        | &check;          |
| Slack non-prod tests    | &#x2612;          | &check;         | &check;          |

For more information on the tests, please refer to the [Confluence page](https://eaflood.atlassian.net/wiki/spaces/MWR/pages/5912559719/EPR+RE+EX+Testing).

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
