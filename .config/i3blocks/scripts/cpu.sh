#!/bin/bash

CPU=$(echo $[100-$(vmstat 1 2|tail -1|awk '{print $15}')])

echo  $CPU%
echo  $CPU%

if (($CPU >= 50 && $CPU < 70)); then
  echo "$2"
elif (($CPU >= 70)); then
  echo "$3"
fi
