#!/bin/sh

charging=""
discharging=""

if command -v "apm" > "$NULL"; then
  pow="$(apm)"

  bat="$(echo "$pow" | awk '/Battery state/ {gsub("%","");print $4;exit}')"

  status="$(echo "$pow" | awk '/A\/C adapter state/ {print $4}')"
  if [ "$status" = "connected" ]; then status="$charging"
  else status="$discharging"
  fi

  echo "${status} ${bat}"
else
  echo ""
fi
