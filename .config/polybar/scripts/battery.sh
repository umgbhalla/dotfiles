#!/bin/sh

charging=""
discharging=""

status="$charging"
if [ "$(bat status)" == "discharging" ]; then
  status="$discharging"
fi

bat="$(bat get)"

if [ "$OS" == "$OS_LINUX" ]; then
  if [ ! -e "/sys/class/power_supply/BAT0" ]; then
    echo "$status"
    exit 0
  fi
fi

echo "${status} ${bat}"
