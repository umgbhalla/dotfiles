#!/bin/sh

charging=""
discharging=""

status="$charging"
if [ "$(bat status)" == "discharging" ]; then
  status="$discharging"
fi

bat="$(bat get)"

echo "${status} ${bat}"
