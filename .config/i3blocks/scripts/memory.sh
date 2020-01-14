#!/bin/bash

total=$(cat /proc/meminfo | grep 'MemTotal' | awk '{ print $2 }')
free=$(cat /proc/meminfo | grep 'MemFree' | awk '{ print $2 }')
used=$(($total - $free))

MEM=$(($used * 100 / $total))

echo  $MEM%
echo  $MEM%

if (($MEM >= 40 && $MEM < 70)); then
  echo "$2"
elif (($MEM >= 70)); then
  echo "$3"
fi
