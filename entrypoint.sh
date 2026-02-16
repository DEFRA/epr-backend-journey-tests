#!/bin/sh

echo "run_id: $RUN_ID"

# Generate data based on PROFILE
if [ "$PROFILE" = "generate" ]; then
    npm run generatedata:allMaterialsMixed:withLinking
    echo "Generated test users"
    exit 0
fi

npm run test:tagged @smoketest

npm run report:publish
publish_exit_code=$?

if [ $publish_exit_code -ne 0 ]; then
  echo "failed to publish test results"
  exit $publish_exit_code
fi

# At the end of the test run, if the suite has failed we write a file called 'FAILED'
if [ -f FAILED ]; then
  echo "test suite failed"
  cat ./FAILED
  exit 1
fi

echo "test suite passed"
exit 0
