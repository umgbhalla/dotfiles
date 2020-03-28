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
  echo "%{c}%{F#FFFF00}%{B#0000FF} $(clock) $(battery)%{F-}%{B-}"
  sleep 1
done
