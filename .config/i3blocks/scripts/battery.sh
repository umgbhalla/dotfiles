#!/bin/bash

BAT=$(cat /sys/class/power_supply/BAT0/capacity)
POWER=$(cat /sys/class/power_supply/BAT0/status)

if (($BAT >= 98)); then
  symbol=
elif (($BAT < 98 && $BAT >= 75)); then
  symbol=
elif (($BAT < 75 && $BAT >= 50)); then
  symbol=
elif (($BAT < 50 && $BAT >= 25)); then
  symbol=
else
  symbol=
fi

echo $symbol $BAT%
echo $symbol $BAT%

if [ $POWER == "Full" ]; then
  echo $1
elif [ $POWER == "Charging" ]; then
  echo $1
elif (($BAT <= 40 && $BAT > 10)); then
  echo $2
elif (($BAT <= 10)); then
  echo $3
fi

