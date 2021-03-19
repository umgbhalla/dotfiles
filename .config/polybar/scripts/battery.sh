#!/bin/sh

charging=""
discharging=""

LINUX_BAT="/sys/class/power_supply/BAT0"

if command -v "apm" > "$NULL"; then
  pow="$(apm)"

  bat="$(echo "$pow" | awk '/Battery state/ {gsub("%","");print $4;exit}')"

  status="$(echo "$pow" | awk '/A\/C adapter state/ {print $4}')"
  if [ "$status" = "connected" ]; then status="$charging"
  else status="$discharging"
  fi

  echo "${status} ${bat}"

elif [ -e "$LINUX_BAT" ]; then
  bat="$(cat "/sys/class/power_supply/BAT0/capacity" 2> "$NULL")"

  status="$(cat "/sys/class/power_supply/BAT0/status")"
  if [ "$status" = "Charging" ]; then status="$charging"
  else status="$discharging"
  fi

  echo "${status} ${bat}"
else
  echo "$discharging"
fi
