#!/bin/sh

echo "run_id: $RUN_ID"

# Generate data based on PROFILE
if [ "$PROFILE" = "generate" ]; then
    npm run generatedata:allMaterialsMixed:withLinking
    echo "Generated test users"
    exit 0
fi

# Best-effort cleanup of every orgId the test suite created. Runs regardless
# of pass/fail — we still want to delete data from failed runs. See PAE-1194.
cleanup_created_orgs() {
  id_file="test-artifacts/created-org-ids.txt"
  if [ ! -s "$id_file" ]; then
    echo "cleanup: no IDs to clean up"
    return 0
  fi
  if [ -z "$ENVIRONMENT" ]; then
    echo "cleanup: ENVIRONMENT not set; skipping"
    return 0
  fi
  backend_url="https://epr-backend.${ENVIRONMENT}.cdp-int.defra.cloud"
  total=$(wc -l < "$id_file" | tr -d ' ')
  echo "cleanup: deleting $total orgs via $backend_url"
  fail=0
  while IFS= read -r id; do
    [ -z "$id" ] && continue
    status=$(curl -sS -o /dev/null -w '%{http_code}' \
      -X DELETE "$backend_url/v1/dev/organisations/$id" || echo "000")
    echo "  cleanup: $id -> $status"
    [ "$status" = "200" ] || fail=$((fail + 1))
  done < "$id_file"
  echo "cleanup: complete. failures: $fail / $total"
  return 0
}

trap 'cleanup_created_orgs' EXIT

npm run test:tagged @smoketest
test_exit_code=$?

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

if [ $test_exit_code -ne 0 ]; then
  echo "test suite exited non-zero"
  exit $test_exit_code
fi

echo "test suite passed"
exit 0
