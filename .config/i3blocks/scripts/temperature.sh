#!/bin/bash

TOTAL_TEMP=0

for i in {0..8}; do
  temp=$(cat /sys/class/thermal/thermal_zone$i/temp)
  TOTAL_TEMP=$(($TOTAL_TEMP + $temp / 1000))
done

TEMP=$(($TOTAL_TEMP / 9))

echo $TEMP°C
echo $TEMP°C

if (($TEMP >= 35 && $TEMP < 45)); then
  echo "$2"
elif (($TEMP >= 45)); then
  echo "$3"
fi
