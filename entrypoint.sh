#!/bin/sh

echo "Starting ZAP in daemon mode..."
# Start ZAP in daemon mode in the background
/zap/zap.sh -daemon -host 0.0.0.0 -port 8080 -config api.addrs.addr.name=.* -config api.addrs.addr.regex=true -config api.key=zap-api-key -silent &

# Wait for ZAP to start
echo "Waiting for ZAP to start..."

timeout=60

while ! curl -f http://localhost:8080/JSON/core/view/version?apikey=zap-api-key; do
    sleep 1
    timeout=$((timeout-1))
    if [ $timeout -eq 0 ]; then
        echo "Timeout waiting for ZAP to start"
        exit 1
    fi
done

echo "ZAP started successfully on port 8080"

echo "run_id: $RUN_ID"
npm run test

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
