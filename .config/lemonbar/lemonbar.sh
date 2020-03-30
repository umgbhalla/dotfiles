#!/bin/bash

clock() {
  DATETIME=$(date "+%a %b %d, %T")
  echo -n "$DATETIME"
}

battery() {
  echo "$(cat /sys/class/power_supply/BAT?/capacity)"
}

# Print the clock

while true; do
  echo "$(clock) $(battery)"
  sleep 1
done
