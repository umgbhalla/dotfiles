#!/bin/bash

BRI=$(printf "%.0f\n" $(light))

echo  $BRI%
echo  $BRI%

if (($BRI >= 75 && $BRI < 90)); then
  echo "$2"
elif (($BRI >= 90)); then
  echo "$3"
fi
